# Lambda / Closure Syntax by Language

Condensed examples — each shows a simple anonymous function (e.g. `x => x + 1`).

| Language | Example |
|----------|---------|
| **Python** | `lambda x: x + 1` |
| **JavaScript / TypeScript** | `x => x + 1` |
| **Java** | `x -> x + 1` |
| **Kotlin** | `{ x: Int -> x + 1 }` |
| **Scala** | `x => x + 1` or `_ + 1` |
| **Swift** | `{ x in x + 1 }` or `{ $0 + 1 }` |
| **Go** | `func(x int) int { return x + 1 }` |
| **Rust** | `\|x\| x + 1` |
| **C#** | `x => x + 1` |
| **C++** | `[](int x){ return x + 1; }` |
| **Ruby** | `-> (x) { x + 1 }` or `proc { \|x\| x + 1 }` |
| **Haskell** | `\x -> x + 1` |
| **OCaml** | `fun x -> x + 1` |
| **F#** | `fun x -> x + 1` |
| **Erlang** | `fun(X) -> X + 1 end` |
| **Elixir** | `fn x -> x + 1 end` or `&(&1 + 1)` |
| **Clojure** | `(fn [x] (+ x 1))` or `#(+ % 1)` |
| **Lua** | `function(x) return x + 1 end` |
| **PHP** | `fn($x) => $x + 1` |
| **Perl** | `sub { $_[0] + 1 }` |
| **Groovy** | `{ x -> x + 1 }` |
| **R** | `function(x) x + 1` or `\(x) x + 1` *(R ≥ 4.1)* |

## Notes

- Most modern languages use arrow syntax (`=>` or `->`) to separate parameters from the body.
- **Rust** closures capture their environment by reference by default; use `move` to capture by value (`move |x| x + 1`).
- **C++** lambdas specify capture mode in `[]`: `[=]` capture by value, `[&]` by reference.
- **Go** has no dedicated lambda keyword; anonymous functions are written with `func`.
- **Haskell / OCaml / F#** use a backslash (`\`) or `fun` keyword inspired by λ-calculus notation.
