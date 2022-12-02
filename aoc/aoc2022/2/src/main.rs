use std::io;
use std::str::FromStr;

#[derive(Debug, Clone)]
struct ParseError;

enum Throw {
    Rock,
    Paper,
    Scissors,
}

impl FromStr for Throw {
    type Err = ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "A" | "X" => Throw::Rock,
            "B" | "Y" => Throw::Paper,
            "C" | "Z" => Throw::Scissors,
            _ => panic!("Bad throw text: {}", s),
        })
    }
}

impl Throw {
    fn value(&self) -> u32 {
        match self {
            Throw::Rock => 1,
            Throw::Paper => 2,
            Throw::Scissors => 3,
        }
    }
}

const LOSE: u32 = 0u32;
const DRAW: u32 = 3u32;
const WIN: u32 = 6u32;

fn score(opponent: Throw, you: Throw) -> u32 {
    let value = you.value();
    return value + match (opponent, you) {
        (Throw::Rock, Throw::Rock) => DRAW,
        (Throw::Paper, Throw::Rock) => LOSE,
        (Throw::Scissors, Throw::Rock) => WIN,

        (Throw::Rock, Throw::Paper) => WIN,
        (Throw::Paper, Throw::Paper) => DRAW,
        (Throw::Scissors, Throw::Paper) => LOSE,

        (Throw::Rock, Throw::Scissors) => LOSE,
        (Throw::Paper, Throw::Scissors) => WIN,
        (Throw::Scissors, Throw::Scissors) => DRAW,
    };
}

fn parse(s: String) -> u32 {
        let mut splits = s.split(" ");
        // We are not told to expect errors in the input, so let's discard errors.
        if let (Some(opponent), Some(you)) = (splits.next(), splits.next()) {
            return score(opponent.parse::<Throw>().unwrap(), you.parse::<Throw>().unwrap());
        } 

        panic!("Oh no.");
}

fn main() {
    // for line in io::stdin().lines() {
    //     println!("Score: {}", parse(line.unwrap()));
    // }
    println!("Total score: {}", 
    io::stdin().lines().map(|line| parse(line.unwrap()) ).sum::<u32>());
}