//mod liboeffis;

use dbus::blocking::{Connection, Proxy};
use dbus::message::SignalArgs;
use std::sync::mpsc::channel;
//use std::thread::sleep;
use std::time::Duration;
use dbus::arg;
//use dbus::arg::RefArg;

mod portal;
use crate::portal::portal::OrgFreedesktopPortalRemoteDesktop;
use crate::portal::request::OrgFreedesktopPortalRequestResponse;

/*
 * Some XDG methods are designed to take longer than DBus's timeout.
 * Ref: https://flatpak.github.io/xdg-desktop-portal/docs/requests.html
 * So, the true response to a method_call can come from a Signal.
 */
fn xdgrequest(proxy: &Proxy<'_, &Connection>, block: impl Fn(&str)) -> Result<OrgFreedesktopPortalRequestResponse, dbus::Error> {
  // > The token that the caller provides should be unique and not
  // > guessable. To avoid clashes with calls made from unrelated libraries,
  //  it is a good idea to use a per-library prefix combined with a random
  //  number.
  //  -- https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.Session.html
  let token = "ttt"; // TODO: make it random
  //
  // > The handle of a session will be of the form
  // > /org/freedesktop/portal/desktop/session/SENDER/TOKEN, where SENDER
  // > is the caller’s unique name, with the initial : removed and all '.'
  // > replaced by _, and TOKEN is a unique token that the caller provided
  // > with the session_handle_token key in the options vardict of the method
  // > creating the session.
  // XXX: Replace unique_name chars like : and _
  let path: dbus::Path = format!("/org/freedesktop/portal/desktop/request/{}/{}", proxy.connection.unique_name().replace(".", "_").replace(":", ""), token).into();

  let (s, r) = channel::<Result<OrgFreedesktopPortalRequestResponse, dbus::Error>>();

  let result = proxy.connection.add_match(OrgFreedesktopPortalRequestResponse::match_rule(None, None).into(),  move |h: OrgFreedesktopPortalRequestResponse, _, m| {
    if m.path().unwrap() != path {
      return true;
    }

    match s.send(Ok(h)) {
      Err(err) => {
        panic!("Channel send shouldn't fail. Error: {}", err)
      },

      // Per docs> The match is also removed if the callback returns “false”.
      Ok(_) => false, // Remove this signal match, we're done using it.
    }
  });

  if result.is_err() {
    return Err(result.err().unwrap())
  }

  block(token);

  // Wait for the XDG Request.Response signal
  loop {
    if let Ok(v) = r.try_recv() {
      return v;
    } else {
      match proxy.connection.process(Duration::from_millis(100)) {
        Ok(_) => { /* keep going ... */},
        Err(e) => panic!("Connection.process() error: {}", e),
      }
    }
  }
}

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

  let resp = xdgrequest(&proxy, |token| {
    let mut options = arg::PropMap::new();
    options.insert("handle_token".to_string(), arg::Variant(Box::new(token.to_string())));
    let session_token = "omg";
    options.insert("session_handle_token".to_string(), arg::Variant(Box::new(session_token.to_string())));
    let resp = proxy.create_session(options);
    println!("Session: {:?}", resp);
  });

  if let Err(err) = resp {
    panic!("xdg request failed: {}", err);
  }

  let resp = resp?;
  println!("Got session handle: {:?}", resp);

  //let devices = proxy.select_devices(session_handle, options);
  //println!("Devices: {:?}", devices);

  Ok(())
}
