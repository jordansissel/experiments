use std::io;

struct Elf {
    lines: io::Lines<std::io::StdinLock<'static>>,
    done: bool,
}

impl Elf {
    fn new() -> Elf {
        Elf { 
            lines: io::stdin().lines(),
            done: false,
        }
    }
}

impl Iterator for Elf {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        let mut count = 0u32;

        if self.done {
            return None;
        }

        while let Some(line) = self.lines.next() {
            match line {
                Err(e) => panic!("Error! {}", e),
                Ok(line) => {
                    if line.is_empty() {
                        return Some(count);
                    } else {
                        count += line.parse::<u32>().unwrap();
                    }
                }
            }
        }

        self.done = true;
        // If we get here, we hit EOF.
        return Some(count);
    }
}

fn main() {
    let elf = Elf::new();

    // Part 1
    // println!("Max elf: {}", elf.max().unwrap());

    // Part 2
    let mut elves = elf.collect::<Vec<u32>>();
    // Sort it reverse so largest is 0th element
    elves.sort_by(|a, b| b.cmp(a));

    // Use Iterator.sum() on the top 3 elves
    println!("Sum of top 3: {}", elves[0..3].iter().sum::<u32>());


}
