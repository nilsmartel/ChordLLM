module ChordLLM

# This is the top-level module. It just pulls in the pieces that live in
# their own files (see below) and re-exports the functions we want users to
# call. Read the individual files to understand each part.

using Flux
using NNlib
using Optimisers
using Random
using Statistics
using StatsBase

# Metal is the Apple-GPU backend. Loading it makes `gpu_device()` pick the GPU
# automatically. It is safe to load even when only training on the CPU.
using Metal

include("Vocab.jl")     # turning chord strings into integer ids and back
include("Data.jl")      # reading the token file and cutting it into songs
include("Model.jl")     # the GPT model itself
include("Train.jl")     # the training loop and checkpoint saving/loading
include("Generate.jl")  # sampling new chord progressions from a trained model

# --- public API -------------------------------------------------------------
# Vocab
export load_vocab, token_to_id, encode, decode, boundary_id
# Data
export parse_lines, split_songs, drop_empty_songs, parse_songs, corpus_ids,
       get_batch, make_example
# Model
export GPTConfig, GPT, CausalSelfAttention, Block
# Train
export loss, train!, save_model, load_model
# Generate
export generate

end # module
