# Train the model on the chord corpus and save it to disk.
# Run from the model/ directory:
#     julia --project scripts/train.jl

using ChordLLM

const ROOT         = joinpath(@__DIR__, "..", "..")               # repo root
const VOCAB_PATH   = joinpath(ROOT, "config", "valid-tokens.csv")
const TOKENS_PATH  = joinpath(ROOT, "output", "tokens")
const CHECKPOINT   = joinpath(@__DIR__, "..", "chordllm.model")   # where to save

# 1. load the vocabulary and the training corpus
vocab = load_vocab(VOCAB_PATH)
t2i   = token_to_id(vocab)
songs = parse_songs(read(TOKENS_PATH, String))
ids   = corpus_ids(songs, t2i; boundary = boundary_id(vocab))
@info "loaded corpus" songs=length(songs) tokens=length(ids)

# 2. build a fresh model (Small defaults) and train it
cfg   = GPTConfig()
model = GPT(cfg)
model = train!(model, ids; steps = 3000, batch = 32)

# 3. save the trained weights
save_model(CHECKPOINT, model)
@info "saved model" path=CHECKPOINT
