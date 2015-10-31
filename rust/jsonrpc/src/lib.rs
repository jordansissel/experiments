extern crate rustc_serialize;
use std::collections::BTreeMap;
use rustc_serialize::json;

type JSONObject = BTreeMap<String, json::Json>;

type JSONRequest = JSONObject;
type JSONResponse = JSONObject;
type JSONNotification = JSONObject;


