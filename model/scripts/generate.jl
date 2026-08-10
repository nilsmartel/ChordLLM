# Generate a chord progression from a trained model.
# Run from the model/ directory (after training):
#     julia --project scripts/generate.jl

using ChordLLM

const ROOT       = joinpath(@__DIR__, "..", "..")
const VOCAB_PATH = joinpath(ROOT, "config", "valid-tokens.csv")
const CHECKPOINT = joinpath(@__DIR__, "..", "chordllm.model")

vocab = load_vocab(VOCAB_PATH)
b     = boundary_id(vocab)
model = load_model(CHECKPOINT)

# Seed with the boundary token to start a fresh song, and stop once the model
# emits the boundary again (= it decided the song is over).
ids    = generate(model, [b]; max_new = 200, temperature = 1.0, top_k = 10, stop = b)
chords = decode(ids, vocab)

println(join(chords, " "))
