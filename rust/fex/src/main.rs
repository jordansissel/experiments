//use std::io;

// 3,4
// Split by space
// Select 3rd split
// Split by comma
// Select 4th split

// enum State {
//     // Splitter,
//     Selector,
// }

use std::iter::Peekable;
use std::str::Chars;

#[derive(Debug)]
enum Error {
    UnexpectedEnd,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", "Unexpected end of code")
    }
}

fn parse_selector(chars: &mut Peekable<Chars>) -> Result<(), Error> {
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
            println!("Digits: {digits}");
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
            println!("Regex: /{regex}/");
        } else if c == '{' {
            // multiselect, read until next }
            let mut select = String::new();

            // Skip leading {
            chars.next();

            while let Some(c) = chars.next() {
                if c == '}' {
                    break;
                } else {
                    select.push(c);
                }
            }
            println!("Select range: {select}");
        } else {
            break;
        }
    }

    return Ok(());
}

fn parse_splitter(chars: &mut Peekable<Chars>) -> Result<(), Error> {
    match chars.next() {
        None => Err(Error::UnexpectedEnd),
        Some(c) => {
            println!("Splitter: {}", c);
            Ok(())
        }
    }
}

fn parse(code: &str) {
    let mut chars = code.chars().peekable();

    while let Some(_) = chars.peek() {
        if let Err(e) = parse_selector(&mut chars) {
            println!("Error parsing select: {e}")
        }

        if let Some(_) = chars.peek() {
            if let Err(e) = parse_splitter(&mut chars) {
                println!("Error parsing splitter: {e}")
            }
        }
    }
}

fn main() {
    let input = "1,2:44 {1,2}:/test/";
    // let text = "hello,world,foo/bar/baz,fizz";

    parse(input);
}
