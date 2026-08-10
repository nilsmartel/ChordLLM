# Vocab.jl
#
# The model does not understand chord strings like "am" or "f#m". It only works
# with integers. This file is all about the translation between the two:
#
#     "am"  <-->  17     (some integer id)
#
# The list of allowed tokens lives in ../config/valid-tokens.csv (256 tokens,
# one per line). We use each token's position in that list (1-based) as its id.
# All functions here are pure: same input always gives the same output.

const START_OF_SONG = "<start-of-song>"

"""
    load_vocab(path) -> Vector{String}

Read the vocabulary file (one token per line). Strips whitespace, drops empty
lines, and checks that we got exactly 256 unique tokens (a mismatch means the
file is wrong, so we fail loudly instead of training on bad data).
"""
function load_vocab(path::AbstractString)::Vector{String}
    lines = readlines(path)
    tokens = [strip(line) for line in lines]        # remove stray whitespace
    tokens = [t for t in tokens if !isempty(t)]     # drop blank lines
    @assert length(tokens) == 256 "expected 256 tokens, got $(length(tokens))"
    @assert length(unique(tokens)) == length(tokens) "vocabulary has duplicates"
    return tokens
end

"""
    token_to_id(vocab) -> Dict{String,Int}

Build a lookup from token string to its 1-based id. This is the reverse of the
`vocab` vector (where `vocab[id]` gives the string back).
"""
function token_to_id(vocab::Vector{String})::Dict{String,Int}
    return Dict(token => id for (id, token) in enumerate(vocab))
end

"""
    encode(tokens, t2i) -> Vector{Int}

Turn a list of chord strings into their integer ids. Strict on purpose: if a
token is not in the vocabulary we throw, because the data should never contain
an unknown token (we verified 0 out-of-vocab tokens in the corpus).
"""
function encode(tokens::Vector{<:AbstractString}, t2i::Dict{String,Int})::Vector{Int}
    return [t2i[String(t)] for t in tokens]
end

"""
    decode(ids, vocab) -> Vector{String}

Turn integer ids back into chord strings.
"""
function decode(ids::Vector{Int}, vocab::Vector{String})::Vector{String}
    return [vocab[id] for id in ids]
end

"""
    boundary_id(vocab) -> Int

The id of the special "<start-of-song>" token. We reuse it as an end-of-song
marker: it terminates each song during training and stops generation.
"""
function boundary_id(vocab::Vector{String})::Int
    id = findfirst(==(START_OF_SONG), vocab)
    @assert id !== nothing "vocabulary is missing the $START_OF_SONG token"
    return id
end
