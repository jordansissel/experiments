#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(dead_code)]

include!(concat!(env!("OUT_DIR"), "/bindings.rs"));

pub fn foo() {
    unsafe {
        let oeffis = oeffis_new(std::ptr::null_mut());

        println!("Oeffis FD: {}", oeffis_get_fd(oeffis));
    }
}
