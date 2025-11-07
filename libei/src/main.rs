mod liboeffis;

use dbus::blocking::Connection;
use dbus::message::SignalArgs;
use std::thread::sleep;
use std::time::Duration;
use dbus::{Message, arg};

mod portal;
use crate::portal::portal::OrgFreedesktopPortalRemoteDesktop;
use crate::portal::request::OrgFreedesktopPortalRequestResponse;

pub fn main() -> Result<(), Box<dyn std::error::Error>> {
  let conn = Connection::new_session()?;
  let proxy = conn.with_proxy("org.freedesktop.portal.Desktop", "/org/freedesktop/portal/desktop", Duration::from_millis(5000));

  let version = proxy.version()?;

  if version != 2 {
    panic!("Unsupported RemoteDesktop portal version: {}", version);
  }

  let name = conn.unique_name();

  println!("Version? {:?}", version);
  println!("Conn unique name: {}", name);

  println!("Signal name? {}" , OrgFreedesktopPortalRequestResponse::NAME);
  println!("Signal interface? {}" , OrgFreedesktopPortalRequestResponse::INTERFACE);
  proxy.match_signal(|h: OrgFreedesktopPortalRequestResponse, _: &Connection, _: &Message| {
    println!("Got Request Response: {:?}", h);
    true
  })?;

  let token = "testing";
  let session_token = "sessiontok";

  let mut options = arg::PropMap::new();
  options.insert("handle_token".to_string(), arg::Variant(Box::new(token.to_string())));
  options.insert("session_handle_token".to_string(), arg::Variant(Box::new(session_token.to_string())));

  let session = proxy.create_session(options)?;
  println!("Session: {:?}", session);
  //println!("Session? {:?}", result.get("session"));

  Ok(())
}
