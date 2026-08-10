# Model

A small, from-scratch GPT-style transformer, written in Julia, that learns to
generate guitar chord progressions. It trains on the refined token stream in
`../output/tokens` using the 256 chord tokens listed in
`../config/valid-tokens.csv`.

## Requirements

- an Apple-silicon Mac (training uses the GPU via Metal)
- macOS 14 or newer
- Julia 1.10 or newer

## Setup

From this directory:

```
julia --project -e 'using Pkg; Pkg.instantiate()'
```

## Structure

The code is split into small files under `src/`:

- `Vocab.jl` — turns chord strings into integer ids and back
- `Data.jl` — reads the token file and cuts it into individual songs
- `Model.jl` — the GPT model (embeddings, attention, transformer blocks)
- `Train.jl` — the training loop and saving/loading of models
- `Generate.jl` — sampling new progressions from a trained model

The `Vocab.jl` and `Data.jl` functions are pure and have unit tests in `test/`.

## Usage

Train a model (saves to `chordllm.model`):

```
julia --project scripts/train.jl
```

Generate a progression from the trained model:

```
julia --project scripts/generate.jl
```

Run the tests:

```
julia --project -e 'using Pkg; Pkg.test()'
```

## How it works

Every chord is turned into an integer id. All songs are joined into one long
stream, with a `<start-of-song>` token marking the end of each song. The model
reads a window of that stream and, for every position, tries to predict the
next chord. Training just means nudging the weights until those predictions get
good. To generate, we seed the model with the `<start-of-song>` token, let it
predict one chord at a time, and stop when it produces `<start-of-song>` again.

## Metal notes

A couple of things to keep in mind about the Apple GPU:

- everything runs in `Float32` (Metal does not do `Float64`)
- generation runs on the CPU — the model is tiny, so it is fast, and it avoids
  GPU quirks around indexing single values
- the Metal backend occasionally produces a bad (NaN/Inf) gradient. The training
  loop notices this and simply skips that step, so it does not wreck the model.
  A handful of skipped steps out of thousands is normal.
