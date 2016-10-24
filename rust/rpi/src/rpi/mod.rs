extern crate libc;
use std::os::unix::io::AsRawFd;
use std::fs::OpenOptions;

pub struct GPIO {
  address: *mut libc::c_void
}

//#[derive(Debug)]
//pub enum Pull {
  //Up,
  //Down,
//}

#[derive(Debug)]
pub enum Mode {
    //Input(Pull),
    Output,
}

const GPIO_PIN_SET: u32 = 0x001C;
const GPIO_PIN_CLEAR: u32 = 0x0028;

impl GPIO {
  pub fn new() -> GPIO {
    let devmem = match OpenOptions::new().write(true).read(true).open("/dev/gpiomem") {
      Ok(s) => s,
      Err(e) => { 
        panic!("Failed: {:?}", e);
      }
    };

    let c_null = 0 as *mut libc::c_void;

    let mmap: *mut libc::c_void;

    unsafe {
      mmap = libc::mmap(c_null, 4096, libc::PROT_READ | libc::PROT_WRITE,
                             libc::MAP_SHARED, devmem.as_raw_fd(), 0);
    }

    return GPIO{address: mmap};
  }

  fn u32offset8(&self, offset: u32) -> *mut u32 {
    unsafe {
      return self.address.offset(offset as isize) as *mut u32;
    }
  }

  // TODO(sissel): Return a result
  pub fn setup(&self, pin: u32, mode: Mode) -> Pin {
    match mode {
      Mode::Output => {
        let output = Pin::with_gpio(pin, self);
        output.setup();
        output
      }
    }
  }

  pub fn output(&self, pin: u32, value: Value) {
    let base = match value {
      Value::High => GPIO_PIN_SET,
      Value::Low => GPIO_PIN_CLEAR,
    };

    unsafe {
      let address = self.u32offset8(base).offset((pin / 32) as isize);
      *address = 1 << pin;
    }
  }
}

pub struct Pin<'a> {
  pin: u32,
  gpio: &'a GPIO,
  set_address: *mut u32,
  clear_address: *mut u32,
  pin_bit: u32,
}

impl<'a> Pin<'a> {
  pub fn with_gpio(pin: u32, gpio: &'a GPIO) -> Pin<'a> {
    let s: *mut u32; 
    let c: *mut u32; 

    unsafe {
      s = gpio.u32offset8(GPIO_PIN_SET).offset((pin / 32) as isize);
      c = gpio.u32offset8(GPIO_PIN_CLEAR).offset((pin / 32) as isize);
    }

    Pin{
      pin: pin,
      gpio: gpio,
      set_address: s,
      clear_address: c,
      pin_bit: 1 << pin
    }
  }

  pub fn setup(&self) {
    // Each pin function selection is 3 bits wide.
    // For 32 bits, this gives us 10 pins.
    // ^^ BCM2835 ARM Peripherals 6.1
    let offset = self.pin / 10;
    let shift = 3 * (self.pin % 10);
    let gpfsel = self.gpio.u32offset8(offset);

    unsafe {
      // Output mode is binary 001 
      *gpfsel = (*gpfsel & !(0b111 << shift)) | (0b001 << shift);
    }
  }

  pub fn set(&self) {
    //println!("set: {:x} {:b}", (self.set_address as usize) - (self.gpio.address as usize), self.pin_bit);
    unsafe { *self.set_address = self.pin_bit }
  }

  pub fn clear(&self) {
    //println!("clear: {:x} {:b}", (self.clear_address as usize) - (self.gpio.address as usize), self.pin_bit);
    unsafe { *self.clear_address = self.pin_bit }
  }
}

#[derive(Debug)]
pub enum Value {
  High,
  Low,
}

