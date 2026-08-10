# Data.jl
#
# Turning the raw token file (../output/tokens) into training material.
#
# The file is one token per line. Songs are separated by a "<start-of-song>"
# line. Sometimes several "<start-of-song>" lines appear in a row, which would
# create empty songs -- we drop those. The pipeline is:
#
#   raw text -> lines -> songs (chord-only) -> drop empty -> one id stream
#
# Every function here is pure so it is easy to unit-test.

"""
    parse_lines(text) -> Vector{String}

Split the raw text on newlines, strip whitespace, and drop empty lines.
"""
function parse_lines(text::AbstractString)::Vector{String}
    lines = split(text, '\n')
    stripped = [String(strip(line)) for line in lines]
    return [line for line in stripped if !isempty(line)]
end

"""
    split_songs(lines; marker="<start-of-song>") -> Vector{Vector{String}}

Cut the list of tokens into songs. A new (initially empty) song begins at each
`marker`; the marker itself is NOT kept inside the song. Any tokens appearing
before the very first marker are ignored (the real corpus always starts with a
marker, so nothing is lost).

Note: this can produce empty songs when two markers sit next to each other.
That is intentional -- `drop_empty_songs` removes them in the next step.
"""
function split_songs(lines::Vector{String}; marker::AbstractString=START_OF_SONG)::Vector{Vector{String}}
    songs = Vector{Vector{String}}()
    for token in lines
        if token == marker
            push!(songs, String[])          # a marker starts a fresh song
        elseif !isempty(songs)
            push!(songs[end], token)         # otherwise the token belongs to the current song
        end
    end
    return songs
end

"""
    drop_empty_songs(songs) -> Vector{Vector{String}}

Remove songs with no chords (these come from consecutive markers).
"""
function drop_empty_songs(songs::Vector{Vector{String}})::Vector{Vector{String}}
    return [song for song in songs if !isempty(song)]
end

"""
    parse_songs(text) -> Vector{Vector{String}}

Full parse: raw text -> list of non-empty, chord-only songs.
"""
function parse_songs(text::AbstractString)::Vector{Vector{String}}
    return drop_empty_songs(split_songs(parse_lines(text)))
end

"""
    corpus_ids(songs, t2i; boundary) -> Vector{Int}

Flatten all songs into one long stream of integer ids for training. After each
song we append the `boundary` id (the "<start-of-song>" token reused as an
end-of-song marker). So the stream looks like:

    [chords of song 1..., boundary, chords of song 2..., boundary, ...]

This teaches the model where songs end, and the boundary that ends one song
also sits right before the next song's first chord -- so the model learns how
songs begin too, for free.
"""
function corpus_ids(songs::Vector{Vector{String}}, t2i::Dict{String,Int}; boundary::Int)::Vector{Int}
    ids = Int[]
    for song in songs
        append!(ids, encode(song, t2i))
        push!(ids, boundary)                 # end-of-song marker
    end
    return ids
end

"""
    make_example(ids, start, block_size) -> (X, Y)

Take one training window out of the id stream, starting at index `start`.
`X` is `block_size` tokens; `Y` is the same window shifted one step to the
right -- i.e. for every position, `Y` holds the *next* token, which is exactly
what the model must learn to predict.
"""
function make_example(ids::Vector{Int}, start::Int, block_size::Int)
    X = ids[start : start + block_size - 1]
    Y = ids[start + 1 : start + block_size]
    return X, Y
end

"""
    get_batch(ids, block_size, batch) -> (X, Y)

Build a random training batch. Both `X` and `Y` are `(block_size, batch)`
integer matrices (one column per example). `Y` is `X` shifted by one token.
"""
function get_batch(ids::Vector{Int}, block_size::Int, batch::Int)
    # pick random start positions, leaving room for the shifted target
    starts = rand(1:(length(ids) - block_size - 1), batch)
    X = zeros(Int, block_size, batch)
    Y = zeros(Int, block_size, batch)
    for (col, s) in enumerate(starts)
        xi, yi = make_example(ids, s, block_size)
        X[:, col] = xi
        Y[:, col] = yi
    end
    return X, Y
end
