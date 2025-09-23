use std::collections::HashSet;

fn main() {
    let input = std::io::stdin().lines();

    let Some(valid_file) = std::env::args().nth(1) else {
        eprintln!(
            "Error: expect first argument to be path to file containing list of valid chords"
        );
        std::process::exit(1);
    };

    let valid_set: HashSet<String> = std::fs::read_to_string(&valid_file)
        .expect("read valid chord file into string")
        .lines()
        .map(str::to_owned)
        .collect();

    for line in input {
        let line = line.expect("line to be readable into string");
        // only simplify "new" chords
        if valid_set.contains(&line) {
            println!("{}", line);
            continue;
        }
        // Simplify chord
        let chord = simplify_chord(line, &valid_set);
        // and only print it, if it is contained in target set.
        if valid_set.contains(&chord) {
            println!("{}", chord);
        }
    }
}

fn simplify_chord(mut input: String, valid_set: &HashSet<String>) -> String {
    for f in [
        remove_overlayed_chords,
        remove_odd_characters,
        remove_maj_min,
        remove_digits,
    ] {
        let simplified = f(input);
        if valid_set.contains(&simplified) {
            return simplified;
        }
        input = simplified;
    }
    
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
    input.replace("maj", "").replace("min", "").replace("sus", "")
}

fn remove_odd_characters(input: String) -> String {
    let is_legit = |c: char| c.is_ascii_alphanumeric() || c == '/' || c == '#';
    input.chars().filter(|c| is_legit(*c)).collect()
}
