extern crate foo;

use foo::Rectangle;

#[test]
fn it_computes_correct_area() {
  let r = Rectangle { width: 2f64, height: 3f64, };
  assert_eq!(r.area(), 2f64 * 3f64);
}

#[test]
fn it_computes_correct_perimter() {
  let r = Rectangle { width: 2f64, height: 3f64, };
  assert_eq!(r.perimeter(), 10f64);
}
