//use std::io::prelude::*;
//use std::os::ext::io::AsRawFd;
use std::os::unix::io::AsRawFd;
use std::fs::OpenOptions;
extern crate libc;


fn main() {
  println!("Hello, world!");

  let devmem = match OpenOptions::new().write(true).read(true).open("/dev/gpiomem") {
    Ok(s) => s,
    Err(e) => { 
      println!("Failed: {:?}", e);
      return;
    }
  };

  let memfd = devmem.as_raw_fd();
  let address: *mut libc::c_void;
  let c_null = 0 as *mut libc::c_void;

  unsafe {
    address = libc::mmap(c_null, 4096, libc::PROT_READ | libc::PROT_WRITE, libc::MAP_SHARED, memfd, 0);
  }

  // BCM2835 docs: "All accesses are assumed to be 32bit"
  let mut addr = address as *mut u32;

  println!("Address: {:?}", address);

  // 0x7E200000 - 0x7E200014 are 32-bit parts with 3 bits each representing the configuration ("function select") of each GPIO pin.
  unsafe {
    for fsel in 0..6 {
      let fselread = *addr.offset(0x0000 + 4*fsel);
      for pin in 0..10 {
        let num = fsel * 10 + pin;
        let value = (fselread >> (pin * 3)) & 7;
        match value {
          0 /* 000 */ => println!("Pin {} is an input", num),
          1 /* 001 */ => println!("Pin {} is an input", num),
          2 /* 010 */ => println!("Pin {} is function5", num),
          3 /* 011 */ => println!("Pin {} is function4", num),
          4 /* 100 */ => println!("Pin {} is function0", num),
          5 /* 101 */ => println!("Pin {} is function1", num),
          6 /* 110 */ => println!("Pin {} is function2", num),
          7 /* 111 */ => println!("Pin {} is function3", num),
          _ => println!("Pin {} unknown: {:.3b}", num, value)
        }
      }
    }
  }


  // 0x7e20 should be the where `/dev/gpiomem` dumps us, so everything is relative to that.
  // 0x7e200034 and 0x7e200038 are both 32-bits (each) containing pin levels.
  unsafe {
    let pinset1 = *(addr.offset(0x34/4));
    println!("0..32: {:32.0b}", pinset1);
    let pinset2 = *(addr.offset(0x38/4));
    println!("33..64: {:32.0b}", pinset2);
  }
}
