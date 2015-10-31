extern crate hyper;
use hyper::Client;

fn main() {
  let client = Client::new();
  let request = client.get("http://logstash.net:333/");
  match request.send() {
    Ok(response) => { println!("Response: {:?}", response) },
    Err(err) => { println!("Error: {:?}", err) }
  }
}
