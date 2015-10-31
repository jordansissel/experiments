use std::net::{TcpStream, Shutdown};
use std::thread;
use std::io::prelude::*;

fn ready(stream: &mut TcpStream) {
  println!("Ready: {}", stream.peer_addr().unwrap());

  match stream.try_clone() {
    Ok(mut s) => { 
      thread::spawn(move || { 
        terminate_after(&mut s, 1000u32)  
      });
    }
    Err(e) => { panic!(e) }
  }

  let mut buffer = [0;128];
  println!("Reading...");
  match stream.read(&mut buffer) {
    Ok(bytes) => { println!("Read {} bytes", bytes) }
    Err(e) => { panic!(e) }
  }
}

fn terminate_after(s: &mut TcpStream, d: u32) {
  thread::sleep_ms(d);
  println!("Closing stream");
  match s.shutdown(Shutdown::Both) {
    Ok(()) => { println!("ok") }
    Err(e) => { panic!(e) }
  }
}

fn main() {
  let stream = TcpStream::connect("google.com:80");
  match stream {
    Ok(mut c) => { ready(&mut c) },
    Err(e) => { panic!(e) }
  }
}
