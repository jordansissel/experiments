//mod liboeffis;

use dbus::blocking::{Connection, Proxy};
use dbus::message::SignalArgs;
use std::env;
use std::sync::mpsc::channel;
use std::time::Duration;
use dbus::arg;
//use dbus::arg::RefArg;

mod portal;
use crate::portal::portal::OrgFreedesktopPortalRemoteDesktop;
use crate::portal::request::OrgFreedesktopPortalRequestResponse;
use crate::portal::session::{self, OrgFreedesktopPortalSessionClosed};

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

  let static_path = Box::leak(Box::new(path.clone()));
  let result = proxy.connection.add_match(OrgFreedesktopPortalRequestResponse::match_rule(None, Some(static_path)).into(),  move |h: OrgFreedesktopPortalRequestResponse, _, m| {
    //if m.path().unwrap() != path {
      //return true;
    //}

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
  let args: Vec<String> = env::args().collect();

  let restore_token = if args.len() == 2 {
    Some(&args[1])
  } else {
    None
  };



  let conn = Connection::new_session()?;
  let proxy = conn.with_proxy("org.freedesktop.portal.Desktop", "/org/freedesktop/portal/desktop", Duration::from_millis(5000));

  let version = OrgFreedesktopPortalRemoteDesktop::version(&proxy)?;

  if version != 2 {
    panic!("Unsupported RemoteDesktop portal version: {}", version);
  }

  let devices = OrgFreedesktopPortalRemoteDesktop::available_device_types(&proxy)?;

  let name = conn.unique_name();

  println!("Version? {:?}", version);
  println!("Devices? {}: {:?}",
    devices,
    [if 0 != (devices & 1) { "Keyboard" } else { "" },
      if 0 != (devices & 2) { "Pointer" } else { "" },
      if 0 != (devices & 4) { "Touchscreen" } else { "" }]);
  println!("Conn unique name: {}", name);

  let session_token = "omg";
  let session_handle: dbus::Path = format!("/org/freedesktop/portal/desktop/session/{}/{}", name.replace(":", "").replace(".", "_"), session_token).into();

  if true {
    let sh = Box::leak(Box::new(session_handle.clone()));
    let _result = proxy.connection.add_match( OrgFreedesktopPortalSessionClosed::match_rule(None, Some(sh)),
      move |h: OrgFreedesktopPortalSessionClosed , _, m| {
        println!("Session:Close() Signal: {:?}", h);
        false
      });
  }

  let resp = xdgrequest(&proxy, |token| {
    let mut options = arg::PropMap::new();
    options.insert("handle_token".to_string(), arg::Variant(Box::new(token.to_string())));
    options.insert("session_handle_token".to_string(), arg::Variant(Box::new(session_token.to_string())));

    // TODO: add signal matcher for org.freedesktop.portal.Session:Closed
    let resp = proxy.create_session(options);
    println!("Session: {:?}", resp);
  });

  if let Err(err) = resp {
    panic!("xdg request failed: {}", err);
  }

 let resp = resp?;
  println!("Got session handle: {:?}", resp);
  let shret : dbus::Path<'static> = arg::prop_cast::<String>(&resp.results, "session_handle").unwrap().clone().into();
  if shret != session_handle {
    panic!("computed session_handle didn't match returned value: actual {} vs expected {}", shret, session_handle);
  }

  println!("Got session_handle: {:?}", session_handle);

  let resp = xdgrequest(&proxy, |token| {
    let mut options = arg::PropMap::new();
    options.insert("handle_token".into(), arg::Variant(Box::new(token.to_string())));
    //options.insert("session_handle_token".to_string(), arg::Variant(Box::new(session_token.to_string())));
    options.insert("persist_mode".into(), arg::Variant(Box::new(2u32)));
    if let Some(restore) = restore_token {
      options.insert("restore_token".into(),arg::Variant(Box::new(restore.clone())));
    }

    let devices = proxy.select_devices(session_handle.clone(), options);
    println!("Devices: {:?}", devices);
  });

  println!("SelectDevices response: {:?}", resp?);

  let resp = xdgrequest(&proxy, |token| {
    let mut options = arg::PropMap::new();
    options.insert("handle_token".to_string(), arg::Variant(Box::new(token.to_string())));
    //options.insert("session_handle_token".to_string(), arg::Variant(Box::new(session_token.to_string())));
    //options.insert("persist_mode".to_string(), arg::Variant(Box::new(2u32)));

    let startresp = proxy.start(session_handle.clone(), "", options);
    println!("Start: {:?}", startresp);
  });

  println!("Start response: {:?}", resp);

  if let Err(err) = resp {
    panic!("xdg request failed: {}", err);
  }

  let resp = resp?;
  let restore_token: String = arg::prop_cast::<String>(&resp.results, "restore_token").unwrap().clone().into();

  println!("Restore token: {}", restore_token);

  let options = arg::PropMap::new();
  let resp = proxy.connect_to_eis(session_handle, options);

  println!("ConnectToEIS: {:?}", resp);

  Ok(())
}
