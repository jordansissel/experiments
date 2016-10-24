use std::{time, thread};
extern crate libc;
mod rpi;

use rpi::{GPIO, Mode, Value};

fn main() {
  let gpio = GPIO::new();

  let pin = gpio.setup(21, Mode::Output);

  let interval = 10000000;
  let step = 100000;

  loop {
    let mut duty_cycle = 0;
    while duty_cycle < interval {
      duty_cycle += step;
      pin.set();
      thread::sleep(time::Duration::new(0,duty_cycle));
      pin.clear();
      thread::sleep(time::Duration::new(0,interval - duty_cycle));
    }

    duty_cycle = interval;
    while duty_cycle > 0 {
      duty_cycle -= step;
      pin.set();
      thread::sleep(time::Duration::new(0,duty_cycle));
      pin.clear();
      thread::sleep(time::Duration::new(0,interval - duty_cycle));
    }
  }
}
