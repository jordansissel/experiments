#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(dead_code)]

include!(concat!(env!("OUT_DIR"), "/bindings.rs"));

enum EventTypes {
  oeffis_event_type_OEFFIS_EVENT_CLOSED,
  oeffis_event_type_OEFFIS_EVENT_DISCONNECTED,
  oeffis_event_type_OEFFIS_EVENT_NONE,
  oeffis_event_type_OEFFIS_EVENT_CONNECTED_TO_EIS,
}
pub fn foo() {
  unsafe {
    let oeffis = oeffis_new(std::ptr::null_mut());
    let ei = ei_new_sender(std::ptr::null_mut());
    ei_configure_name(ei, c"example".as_ptr());

    println!("Oeffis FD: {}", oeffis_get_fd(oeffis));
    oeffis_create_session(oeffis, oeffis_device_OEFFIS_DEVICE_POINTER|oeffis_device_OEFFIS_DEVICE_KEYBOARD);

    loop {
      oeffis_dispatch(oeffis);
      let event = oeffis_get_event(oeffis);

      match event {
        oeffis_event_type_OEFFIS_EVENT_CLOSED => { println!("Closed") },
        oeffis_event_type_OEFFIS_EVENT_CONNECTED_TO_EIS => {
          let ei_fd = oeffis_get_eis_fd(oeffis);
          ei_setup_backend_fd(ei, ei_fd);

          println!("Connected")
        },
        oeffis_event_type_OEFFIS_EVENT_DISCONNECTED => { println!(" disconnected") },
        oeffis_event_type_OEFFIS_EVENT_NONE => { },
        _ => { panic!("Unexpected"); }

      }
    }
  }
}
