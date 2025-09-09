fn main() {
    println!("Hello, world!");
}

fn remove_digits(input: String) -> String {
    input.chars().filter(|c| *c <= '0' || *c >= '9').collect()
}
