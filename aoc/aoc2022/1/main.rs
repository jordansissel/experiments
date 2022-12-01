use std::io;

fn main() {
    let mut elves = vec![];
    let mut count = 0;

    for line in io::stdin().lines() {
        if let Err(e) = line {
            println!("Error reading line: {}", e);
            return;
        }

        let text = line.unwrap();

        if text.is_empty() {
            elves.push(count);
            count = 0;
            continue;
        }

        let calories = text.parse::<i32>().unwrap();
        count += calories;
    }
    if count > 0 { elves.push(count); }

    let max = elves.iter().max();
    println!("Max: {}", max.unwrap());
}
