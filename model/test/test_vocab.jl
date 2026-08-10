# Tests for Vocab.jl -- the token <-> id translation.

# path to the real vocabulary file (two levels up: test -> model -> repo root)
const VOCAB_PATH = joinpath(@__DIR__, "..", "..", "config", "valid-tokens.csv")

@testset "vocab" begin
    vocab = load_vocab(VOCAB_PATH)

    @test length(vocab) == 256
    @test length(unique(vocab)) == 256
    @test vocab[14] == "<start-of-song>"      # the boundary token sits on line 14
    @test boundary_id(vocab) == 14

    t2i = token_to_id(vocab)

    # encode then decode should give the original tokens back
    sample = ["g", "c", "am", "<start-of-song>"]
    @test decode(encode(sample, t2i), vocab) == sample

    # unknown tokens must raise, not silently pass
    @test_throws KeyError encode(["not-a-real-chord"], t2i)
end
