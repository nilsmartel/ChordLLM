# Tests for Data.jl -- parsing the token file into training material.

@testset "data" begin

    @testset "parse_lines strips and drops empties" begin
        @test parse_lines("a\n\n b \n") == ["a", "b"]
    end

    @testset "split_songs cuts at each marker, marker not kept" begin
        lines = ["<start-of-song>", "a", "<start-of-song>", "<start-of-song>", "b"]
        songs = split_songs(lines)
        # 3 songs: ["a"], [] (from the doubled marker), ["b"]
        @test length(songs) == 3
        @test songs[1] == ["a"]
        @test songs[2] == String[]     # the empty song from consecutive markers
        @test songs[3] == ["b"]
    end

    @testset "drop_empty_songs removes the empty ones" begin
        songs = [["a"], String[], ["b"]]
        @test drop_empty_songs(songs) == [["a"], ["b"]]
    end

    @testset "corpus_ids appends the boundary after each song" begin
        vocab = ["x", "y", "<b>"]           # tiny fake vocab, boundary id = 3
        t2i = Dict("x" => 1, "y" => 2, "<b>" => 3)
        songs = [["x", "y"], ["y"]]
        ids = corpus_ids(songs, t2i; boundary = 3)
        @test ids == [1, 2, 3, 2, 3]        # x y <b> y <b>
    end

    @testset "make_example shifts the target by one" begin
        ids = [1, 2, 3, 4, 5]
        X, Y = make_example(ids, 1, 3)
        @test X == [1, 2, 3]
        @test Y == [2, 3, 4]
    end

    @testset "get_batch produces correctly shaped, shifted batches" begin
        ids = collect(1:100)
        X, Y = get_batch(ids, 8, 4)
        @test size(X) == (8, 4)
        @test size(Y) == (8, 4)
        # each column of Y is its X column shifted by one token
        for col in 1:4
            @test Y[1:end-1, col] == X[2:end, col]
        end
    end

    # Guard against regressions using the real corpus (only if it is present).
    @testset "real corpus parses cleanly" begin
        tokens_path = joinpath(@__DIR__, "..", "..", "output", "tokens")
        if isfile(tokens_path)
            songs = parse_songs(read(tokens_path, String))
            @test all(!isempty, songs)          # no empty songs survive
            @test length(songs) < 12473          # fewer than the raw marker count (empties dropped)
            @test length(songs) > 10000          # but still lots of songs
        else
            @test_skip "output/tokens not found"
        end
    end

end
