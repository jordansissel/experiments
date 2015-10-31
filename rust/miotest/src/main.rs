extern crate mio;
use mio::*;
use mio::tcp::TcpListener;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::collections::HashMap;

const SERVER: Token = Token(0);

struct MyHandler<T> {
  id : AtomicUsize
}

impl Handler for MyHandler {
  type Timeout = ();
  type Message = ();

  fn readable(&mut self, event_loop: &mut EventLoop<MyHandler>, token: Token, _: ReadHint) {
    match token {
      SERVER => {
        let MyHandler(ref mut server) = *self;
        let sock = server.accept().unwrap().expect("something");
        let t = Token(id.fetch_add(1, Ordering::SeqCst));
        event_loop.register(&sock, t);
      }
      _ =>  {
        println!("Readable: {:?}", token);
      }
    }
  }

}

fn main() {
  let addr = "127.0.0.1:5000".parse().unwrap();
  let server = match tcp::listen(&addr) {
    Ok(x) => x,
    Err(err) => panic!("listen failed: {}", err),
  };

  let mut event_loop = EventLoop::new().unwrap();

  let mut h = MyHandler(server);
  event_loop.register(&server, SERVER).unwrap();
  event_loop.run(&mut h).unwrap();
}
