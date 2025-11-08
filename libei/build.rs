use std::env;
use std::path::PathBuf;

fn main() {
    //let liboeffis = pkg_config::probe_library("liboeffis-1.0").unwrap();
    let libei = pkg_config::probe_library("libei-1.0").unwrap();

    //for lib in liboeffis.libs {
        //println!("cargo::rustc-link-lib={}", lib);
    //}

    for lib in libei.libs {
        println!("cargo::rustc-link-lib={}", lib);
    }

    //let oeffis_includes = liboeffis.include_paths.iter().map(|path| format!("-I{}", path.to_string_lossy()));
    let ei_includes = libei.include_paths.iter().map(|path| format!("-I{}", path.to_string_lossy()));

    let bindings = bindgen::Builder::default()
        //.clang_args(oeffis_includes)
        .clang_args(ei_includes)
        .header("src/wrapper.h")
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .generate()
        .expect("Unable to generate bindings");

    let out_path = PathBuf::from(env::var("OUT_DIR").unwrap());

    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("Couldn't write bindings!");
}
