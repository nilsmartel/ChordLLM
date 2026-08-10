# Tests for Model.jl -- run on the CPU (no GPU needed).

@testset "model" begin

    # a tiny model, just big enough to exercise the shapes
    cfg = GPTConfig(vocab_size=16, block_size=8, d_model=16, n_heads=2, n_layers=2, dropout=0.0)

    @testset "forward pass has the right shape" begin
        model = GPT(cfg)
        T, B = 5, 3
        idx = rand(1:cfg.vocab_size, T, B)
        logits = model(idx)
        @test size(logits) == (cfg.vocab_size, T, B)
    end

    # The most important correctness test: the model must be *causal*. Changing
    # tokens in the future must never change the predictions for the past.
    @testset "attention is causal (no peeking at the future)" begin
        model = GPT(cfg)
        T = 6
        idx = rand(1:cfg.vocab_size, T, 1)
        base = model(idx)

        t = 3
        idx2 = copy(idx)
        # change every token strictly after position t (guaranteed to differ)
        idx2[t+1:end, 1] .= mod1.(idx[t+1:end, 1] .+ 1, cfg.vocab_size)
        changed = model(idx2)

        # predictions at positions 1..t must be identical
        @test base[:, 1:t, 1] ≈ changed[:, 1:t, 1]
        # sanity: the future positions actually did change
        @test !(base[:, t+1:end, 1] ≈ changed[:, t+1:end, 1])
    end

end
