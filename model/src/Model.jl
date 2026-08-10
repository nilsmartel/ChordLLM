# Model.jl
#
# A small GPT-style transformer, built by hand from Flux building blocks so the
# whole thing stays readable. Data flows like this:
#
#   token ids (T, B)
#     -> token embedding + position embedding      (d_model, T, B)
#     -> N transformer blocks (attention + MLP)     (d_model, T, B)
#     -> final LayerNorm + linear head              (vocab,   T, B)  = logits
#
# Shapes are "feature-first": the first dimension is the feature/channel size,
# then time (T), then batch (B). That is the convention Flux layers expect.

"""
    GPTConfig

All the knobs of the model in one place. Defaults are the "Small" (~3M param)
size that trains comfortably on an Apple GPU.
"""
Base.@kwdef struct GPTConfig
    vocab_size::Int = 256     # number of distinct tokens (chords + boundary)
    block_size::Int = 128     # how many tokens of context the model can see
    d_model::Int    = 256     # width of the embeddings / hidden state
    n_heads::Int    = 8       # number of attention heads (d_model must divide by this)
    n_layers::Int   = 6       # number of transformer blocks stacked on top of each other
    dropout::Float64 = 0.1    # dropout probability (regularization during training)
end

# ---------------------------------------------------------------------------
# Causal self-attention: every position looks at earlier positions (never the
# future) and mixes their information together.
# ---------------------------------------------------------------------------
struct CausalSelfAttention
    qkv::Dense        # projects x into query, key and value (packed together)
    proj::Dense       # projects the attention output back to d_model
    n_heads::Int
    drop::Dropout
end
Flux.@layer CausalSelfAttention

function CausalSelfAttention(cfg::GPTConfig)
    d = cfg.d_model
    @assert d % cfg.n_heads == 0 "d_model must be divisible by n_heads"
    return CausalSelfAttention(
        Dense(d => 3d; bias=false),   # one Dense produces q, k and v at once
        Dense(d => d),                # output projection
        cfg.n_heads,
        Dropout(cfg.dropout),
    )
end

# x :: (d_model, T, B)  ->  (d_model, T, B)
function (m::CausalSelfAttention)(x)
    d, T, B = size(x)
    h  = m.n_heads
    hd = d ÷ h                                   # size of each head

    qkv = m.qkv(x)                               # (3d, T, B)
    q = qkv[1:d,        :, :]
    k = qkv[d+1:2d,     :, :]
    v = qkv[2d+1:3d,    :, :]

    # Split the d_model features into `h` separate heads and fold the head axis
    # into the batch axis so we can use batched matrix multiplies. We use
    # `permutedims` (which copies) rather than a lazy view, because reshaping a
    # view breaks batched_mul on the Metal GPU.
    splitheads(z) = reshape(permutedims(reshape(z, hd, h, T, B), (1, 3, 2, 4)), hd, T, h * B)
    q, k, v = splitheads(q), splitheads(k), splitheads(v)

    # Attention scores: how much each query attends to each key.
    # scores[key, query, batch], scaled so gradients stay well-behaved.
    scores = NNlib.batched_mul(NNlib.batched_transpose(k), q) ./ Float32(sqrt(hd))

    # Causal mask: a query may only attend to keys at its own position or before.
    # make_causal_mask(scores)[key, query] is true where attention is allowed.
    # We add a big negative number to the forbidden spots so softmax zeroes them.
    mask = NNlib.make_causal_mask(scores)
    scores = scores .+ ifelse.(mask, 0f0, -1f9)
    attn = NNlib.softmax(scores; dims=1)         # normalize over the key axis
    attn = m.drop(attn)

    # Weighted sum of the values, then merge the heads back together.
    out = NNlib.batched_mul(v, attn)             # (hd, T, h*B)
    out = reshape(permutedims(reshape(out, hd, T, h, B), (1, 3, 2, 4)), d, T, B)
    return m.proj(out)
end

# ---------------------------------------------------------------------------
# One transformer block: attention and a small MLP, each wrapped in a
# LayerNorm and a residual ("skip") connection. This is the GPT-2 "pre-norm"
# arrangement (normalize before each sub-layer).
# ---------------------------------------------------------------------------
struct Block
    ln1::LayerNorm
    attn::CausalSelfAttention
    ln2::LayerNorm
    mlp::Chain
end
Flux.@layer Block

function Block(cfg::GPTConfig)
    d = cfg.d_model
    return Block(
        LayerNorm(d),
        CausalSelfAttention(cfg),
        LayerNorm(d),
        Chain(Dense(d => 4d, gelu), Dense(4d => d), Dropout(cfg.dropout)),
    )
end

function (b::Block)(x)
    x = x + b.attn(b.ln1(x))     # attention sub-layer + residual
    x = x + b.mlp(b.ln2(x))      # feed-forward sub-layer + residual
    return x
end

# ---------------------------------------------------------------------------
# The full model.
# ---------------------------------------------------------------------------
# The `M` type parameter lets the embedding tables be either a plain CPU
# `Matrix` or a GPU `MtlMatrix`, so `model |> gpu` can actually move them.
struct GPT{M<:AbstractMatrix{Float32}}
    tok_emb::M                   # (d_model, vocab)  token embeddings
    pos_emb::M                   # (d_model, block_size)  position embeddings
    drop::Dropout
    blocks::Vector{Block}
    ln_f::LayerNorm              # final LayerNorm
    head::Dense                  # (d_model -> vocab) turns hidden state into logits
    cfg::GPTConfig
end
Flux.@layer GPT trainable=(tok_emb, pos_emb, blocks, ln_f, head)

function GPT(cfg::GPTConfig)
    d = cfg.d_model
    return GPT(
        0.02f0 .* randn(Float32, d, cfg.vocab_size),   # small random init
        0.02f0 .* randn(Float32, d, cfg.block_size),
        Dropout(cfg.dropout),
        [Block(cfg) for _ in 1:cfg.n_layers],
        LayerNorm(d),
        Dense(d => cfg.vocab_size),
        cfg,
    )
end

# idx :: (T, B) integer token ids (1-based)  ->  logits (vocab, T, B)
function (model::GPT)(idx)
    T, B = size(idx)

    # Look up token embeddings. We build a dense one-hot matrix and multiply by
    # the embedding table. Doing it as a plain matrix multiply (rather than
    # Flux.Embedding) keeps the gradient on the GPU path Metal supports best.
    oh  = Float32.(Flux.onehotbatch(vec(idx), 1:model.cfg.vocab_size))  # (vocab, T*B)
    tok = reshape(model.tok_emb * oh, :, T, B)                          # (d, T, B)

    # Add position embeddings (broadcast the (d, T) table across the batch).
    x = model.drop(tok .+ model.pos_emb[:, 1:T])

    for blk in model.blocks
        x = blk(x)
    end
    x = model.ln_f(x)
    return model.head(x)          # (vocab, T, B) logits
end
