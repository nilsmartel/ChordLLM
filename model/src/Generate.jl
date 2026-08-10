# Generate.jl
#
# Sampling new chord progressions from a trained model. We feed the model a
# starting context, ask it to predict the next token, append that token, and
# repeat -- one chord at a time (this is called "autoregressive" generation).
#
# We do this on the CPU: the model is tiny, so it is plenty fast, and it avoids
# GPU quirks around indexing single elements.

"""
    generate(model, seed; kwargs...) -> Vector{Int}

Generate a sequence of token ids, starting from `seed` (a vector of ids). To
generate a fresh song, seed with `[boundary_id(vocab)]` and pass that same id
as `stop` -- generation halts once the model emits the boundary again.

Keyword arguments:
  max_new     - maximum number of tokens to generate
  temperature - randomness: 1.0 = as-trained, lower = safer/repetitive,
                higher = wilder, 0 = always pick the single most likely token
  top_k       - if set, only sample among the k most likely tokens
  stop        - if set, stop as soon as this token id is produced
"""
function generate(model::GPT, seed::Vector{Int};
                  max_new::Int=200,
                  temperature::Real=1.0,
                  top_k::Union{Nothing,Int}=nothing,
                  stop::Union{Nothing,Int}=nothing)

    model = model |> Flux.cpu
    ids = copy(seed)
    bs = model.cfg.block_size

    for _ in 1:max_new
        # feed only the last `block_size` tokens (the model can't see further)
        ctx = ids[max(1, length(ids) - bs + 1):end]
        logits = model(reshape(ctx, :, 1))          # (vocab, T, 1)
        z = Float32.(logits[:, end, 1])             # scores for the next token

        # temperature scales the scores before we turn them into probabilities
        if temperature > 0
            z = z ./ Float32(temperature)
        end

        # optionally keep only the top-k scores, killing the rest
        if top_k !== nothing
            k = min(top_k, length(z))
            threshold = sort(z; rev=true)[k]
            z = map(v -> v < threshold ? -1f9 : v, z)
        end

        # pick the next token: greedily if temperature is 0, else sample
        next = if temperature == 0
            argmax(z)
        else
            probs = NNlib.softmax(z)
            sample(1:length(probs), Weights(probs))
        end

        push!(ids, next)
        if stop !== nothing && next == stop
            break
        end
    end
    return ids
end
