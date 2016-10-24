use std::{time, thread};
extern crate libc;
mod rpi;

use rpi::{GPIO, Mode, Value};

fn main() {
  let gpio = GPIO::new();

  let pin = gpio.setup(21, Mode::Output);

  loop {
    pin.set();
    thread::sleep(time::Duration::new(1,0));
    pin.clear();
    thread::sleep(time::Duration::new(1,0));
  }
}
