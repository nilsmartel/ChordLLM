# Train.jl
#
# The training loop. We repeatedly:
#   1. grab a random batch of (input, next-token) pairs,
#   2. measure how wrong the model's predictions are (the loss),
#   3. nudge the weights a little to reduce that loss.
#
# We use Flux's modern explicit-gradient API (setup / withgradient / update!).

using Serialization   # for saving and loading trained models (stdlib)

"""
    loss(model, X, Y) -> Float32

Cross-entropy loss: how surprised the model is by the true next tokens.
`X` and `Y` are `(block_size, batch)` id matrices; `Y` is `X` shifted by one.
"""
function loss(model::GPT, X, Y)
    logits = model(X)                                   # (vocab, T, B)
    V, T, B = size(logits)
    ŷ = reshape(logits, V, T * B)                       # flatten time and batch
    y = Flux.onehotbatch(vec(Y), 1:V)                   # true next tokens
    return Flux.logitcrossentropy(ŷ, y)                 # softmax + cross-entropy, in one stable step
end

# Are all the arrays in a gradient tree finite (no NaN/Inf)? The Metal GPU
# occasionally produces a non-finite gradient in the backward pass; if we let
# such a gradient reach the optimizer it corrupts every weight. So we check
# first and skip those (rare) steps. The check uses `all(isfinite, x)`, which
# runs on the GPU without copying data back to the CPU.
function grad_is_finite(grads)
    ok = Ref(true)
    Flux.fmap(grads) do x
        if x isa AbstractArray && !all(isfinite, x)
            ok[] = false
        end
        x
    end
    return ok[]
end

"""
    train!(model, ids; kwargs...) -> model

Train `model` on the flat id stream `ids` (from `corpus_ids`). Runs `steps`
gradient updates and prints the loss every `log_every` steps. Returns the
trained model (living on `device`).

Keyword arguments:
  steps      - how many gradient updates to run
  block_size - context length of each training window
  batch      - how many windows per update
  lr         - learning rate
  device     - `gpu_device()` for the Apple GPU, or `cpu` to stay on the CPU
  log_every  - how often to print the current loss
"""
function train!(model::GPT, ids::Vector{Int};
                steps::Int=5000,
                block_size::Int=model.cfg.block_size,
                batch::Int=32,
                lr=3f-4,
                device=Flux.gpu_device(),
                log_every::Int=100)

    model = model |> device
    opt_state = Flux.setup(Optimisers.AdamW(lr), model)   # AdamW is a solid GPT default
    skipped = 0                                            # count of skipped (bad-gradient) steps

    for step in 1:steps
        # a fresh random batch, moved onto the same device as the model
        X, Y = get_batch(ids, block_size, batch)
        X, Y = X |> device, Y |> device

        # compute loss and gradients in one pass
        l, grads = Flux.withgradient(m -> loss(m, X, Y), model)

        # only update the weights if the gradient is healthy (see above)
        if isfinite(l) && grad_is_finite(grads[1])
            Flux.update!(opt_state, model, grads[1])
        else
            skipped += 1
        end

        if step % log_every == 0 || step == 1
            @info "training" step loss=l skipped=skipped
        end
    end
    return model
end

"""
    save_model(path, model)

Save a trained model to disk. We always move it to the CPU first so the file
can be loaded on any machine.
"""
function save_model(path::AbstractString, model::GPT)
    serialize(path, model |> Flux.cpu)
    return path
end

"""
    load_model(path) -> GPT

Load a model previously saved with `save_model` (comes back on the CPU).
"""
function load_model(path::AbstractString)::GPT
    return deserialize(path)
end
