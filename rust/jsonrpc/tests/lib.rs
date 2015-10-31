extern crate jsonrpc;
extern crate rustc_serialize;

use rustc_serialize::json;

#[test]
fn it_works() {
  let request = json::Json::from_str("{ \"testing\": 1234, \"another\": [1,2,3] }").ok().unwrap();
  let request_obj = request.as_object().unwrap();

  assert_eq!(request_obj.get("testing").unwrap().as_u64().unwrap(), 1234u64);
}
