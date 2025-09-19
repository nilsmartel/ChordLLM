use std::collections::HashMap;

fn main() {
    let lines = std::io::stdin().lines().map(|s| s.unwrap());
    let fmap = frequency(lines);

    let mut table = fmap
        .into_iter()
        .map(|(token, freq)| (freq, token))
        .collect::<Vec<_>>();
    table.sort_unstable();

    println!("frequency;token");
    for (freq, token) in table.into_iter().rev() {
        println!("{};{}", freq, token);
    }
}

fn frequency(items: impl Iterator<Item = String>) -> HashMap<String, usize> {
    let mut m = HashMap::new();

    for i in items {
        if i.contains(";") {
            panic!("expected input to not contain the ; character");
        }

        let entry = m.entry(i).or_insert(0);
        *entry += 1;
    }

    m
}
