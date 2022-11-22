use regex::Regex;
use std::env;
use std::io;
use std::iter::Peekable;
use std::ops::RangeInclusive;
use std::str::Chars;

#[derive(Debug)]
enum Step {
    Select(Vec<RangeInclusive<usize>>),
    SelectRegex(Regex),
    Split(char),
    End,
}

#[derive(Debug)]
enum Error {
    UnexpectedEnd,
    InvalidSyntax(char),
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", "Unexpected end of code")
    }
}

fn parse_selector(chars: &mut Peekable<Chars>) -> Result<Step, Error> {
    while let Some(&c) = chars.peek() {
        if c.is_digit(10) {
            // Got digit, read all digits?
            let mut digits = chars.next().unwrap().to_string();
            while let Some(&c) = chars.peek() {
                if c.is_digit(10) {
                    digits.push(c);
                    chars.next();
                } else {
                    break;
                }
            }

            // We scanned one too many, go back.
            // println!("Digits: {digits}");

            let num = digits.parse::<usize>().unwrap();
            return Ok(Step::Select(vec![RangeInclusive::new(num - 1, num - 1)]));
        } else if c == '/' {
            // regex, read until next non-escaped /
            let mut regex = String::new();

            // Skip the leading / for regex.
            chars.next();

            while let Some(c) = chars.next() {
                if c == '\\' {
                    let escaped = chars.next().unwrap();
                    // TODO: implement escaping?
                    regex.push(escaped);
                } else if c == '/' {
                    break;
                } else {
                    regex.push(c);
                }
            }
            // println!("Regex: /{regex}/");

            return Ok(Step::SelectRegex(Regex::new(regex.as_str()).unwrap()));
        } else if c == '{' {
            // multiselect, read until next '}'
            let mut select = String::new();

            // Skip leading {
            chars.next();

            while let Some(c) = chars.next() {
                if c == '}' {
                    break;
                } else if c.is_digit(10) || c == ':' || c == ',' || c == '-' {
                    select.push(c);
                } else {
                    return Err(Error::InvalidSyntax(c));
                }
            }

            return Ok(Step::Select(
                select
                    .split(",")
                    .map(|s| -> RangeInclusive<usize> {
                        if s.contains(":") {
                            let mut splits = s.splitn(2, ':');
                            RangeInclusive::new(
                                splits.next().unwrap().parse::<usize>().unwrap() - 1,
                                splits.next().unwrap().parse::<usize>().unwrap() - 1,
                            )
                        } else {
                            RangeInclusive::new(
                                s.parse::<usize>().unwrap() - 1,
                                s.parse::<usize>().unwrap() - 1,
                            )
                        }
                    })
                    .collect::<Vec<RangeInclusive<usize>>>(),
            ));
        } else {
            panic!("??? unexpected {}", c);
        }
    }

    // Todo: Error?
    return Ok(Step::End);
}

fn parse_splitter(chars: &mut Peekable<Chars>) -> Result<Step, Error> {
    // println!("Split: {}", chars.peek().unwrap());
    match chars.next() {
        None => Err(Error::UnexpectedEnd),
        Some(c) => Ok(Step::Split(c)),
    }
}

fn parse(code: &str) -> Vec<Step> {
    let mut chars = code.chars().peekable();
    let mut steps = vec![];

    // println!("Parsing code: {}", code);

    let first = chars.peek().unwrap();
    if first.is_digit(10) || *first == '{' {
        // println!("Assuming first split is by space");
        steps.push(Step::Split(' '));

        match parse_selector(&mut chars) {
            Err(e) => panic!("Error parsing select #{e}"),
            Ok(step) => steps.push(step),
        }
    }

    while let Some(_) = chars.peek() {
        match parse_splitter(&mut chars) {
            Err(e) => println!("Error parsing splitter: {e}"),
            Ok(step) => steps.push(step),
        }

        if let Some(_) = chars.peek() {
            match parse_selector(&mut chars) {
                Err(e) => panic!("Error parsing select #{e}"),
                Ok(step) => steps.push(step),
            }
        }
    }

    // println!("Steps: {:?}", steps);
    return steps;
}

fn process(input: String, steps: &Vec<Step>) -> Vec<String> {
    let mut fields = vec![input];

    let mut splitchar = ' ';
    for step in steps.iter() {
        fields = match step {
            Step::End => break,
            Step::Select(ranges) => {
                // println!("Step::Select - {:?}", ranges);
                vec![ranges
                    .iter()
                    .map(|r| {
                        if let Some(f) = fields.get(r.clone()) {
                            f.to_vec()
                        } else {
                            panic!("Out of range: Range {:?}, length was {}", r, fields.len());
                        }
                    })
                    .flatten()
                    .collect::<Vec<String>>()
                    .join(splitchar.to_string().as_str())]
            }
            Step::SelectRegex(_regex) => {
                // println!("Step::Regex - {:?}", _regex);
                fields
            }
            Step::Split(c) => {
                splitchar = c.clone();
                // println!("Step::Split({}) -- input: {:#?}", *c, fields);
                fields
                    .iter()
                    .map(|f| {
                        let result: Vec<_> = f.split(*c).map(|s| s.to_string()).collect(); //.flatten().collect()
                                                                                           //   println!("Result: {:#?}", result);
                        result
                    })
                    .flatten()
                    .collect()
            }
        };
        // println!("After: {:#?}", fields);
    }

    fields
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let procs: Vec<Vec<Step>> = args.iter().skip(1).map(|arg| parse(arg)).collect();

    for line in io::stdin().lines() {
        if let Err(e) = line {
            println!("Error reading: {}", e);
            break;
        }

        // println!("Line: '{}'", line.as_ref().unwrap());
        let line = line.unwrap();

        for steps in &procs {
            let line = line.clone();
            let fields = process(line, steps);

            println!("{}", fields.join(" "));
        }
    }
}
