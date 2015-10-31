use std::io;
use std::io::prelude::*;

fn main() {
  let input = io::stdin();
  let mut r = input.lock().lines();
  println!("Line: {:?}", r.next());
}
