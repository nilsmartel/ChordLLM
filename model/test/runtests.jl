using Test
using ChordLLM

@testset "ChordLLM" begin
    include("test_vocab.jl")
    include("test_data.jl")
    include("test_model.jl")
end
