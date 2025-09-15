use std::collections::HashSet;

fn main() {
    let input = std::io::stdin().lines();

    let valid_file = std::env::args()
        .nth(1)
        .expect("first argument to be path to file containing valid chords.");

    let valid_set: HashSet<String> = std::fs::read_to_string(&valid_file)
        .expect("read valid chord file into string")
        .lines()
        .map(str::to_owned)
        .collect();

    for line in input {
        let line = line.expect("line to be readable into string");
        // only simplify "new" chords
        let output = if valid_set.contains(&line) {
            line
        } else {
            simplify_chord(line)
        };
        println!("{}", output);
    }
}

fn simplify_chord(input: String) -> String {
    let input = remove_overlayed_chords(input);
    let input = remove_digits(input);
    let input = remove_maj_min(input);
    let input = remove_odd_characters(input);
    input
}

/// Em7 => Em
fn remove_digits(input: String) -> String {
    input.chars().filter(|c| *c <= '0' || *c >= '9').collect()
}

// am9/gb => am9
fn remove_overlayed_chords(input: String) -> String {
    if let Some((a, _b)) = input.split_once("/") {
        a.to_string()
    } else {
        input
    }
}

fn remove_maj_min(input: String) -> String {
    input.replace("maj", "").replace("min", "")
}

fn remove_odd_characters(input: String) -> String {
    let is_legit = |c: char| c.is_ascii_alphanumeric() || c == '/' || c == '#';
    input.chars().filter(|c| is_legit(*c)).collect()
}
