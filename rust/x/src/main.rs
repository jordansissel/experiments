extern crate rustc_serialize;
use rustc_serialize::json;

#[derive(RustcDecodable, RustcEncodable)]
struct Foo {
  pants: f64,
}

fn main() {
  println!("{}", json::encode(&42i32).unwrap());
  println!("{}", json::encode(&vec!["to", "be", "or", "not", "to", "be"]).unwrap());
  println!("{}", json::encode(&Some(true)).unwrap());        
  println!("{}", json::encode(&Foo { pants: 100f64 }).unwrap());        
}
