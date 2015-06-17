
pub struct Rectangle {
  pub height: f64,
  pub width: f64,
}

impl Rectangle {
  pub fn area(&self) -> f64 {
    self.height * self.width
  }

  pub fn perimeter(&self) -> f64 {
    (self.height + self.width) * 2f64
  }
}
