use std::env;
use std::path::PathBuf;

fn main() {
    let liboeffis = pkg_config::probe_library("liboeffis-1.0").unwrap();

    for lib in liboeffis.libs {
        println!("cargo::rustc-link-lib={}", lib);
    }
        //println!("cargo::rustc-link-search=/usr/lib64");
        //println!("cargo::rustc-link-lib=oeffis");

    let includes = liboeffis.include_paths.iter().map(|path| format!("-I{}", path.to_string_lossy()));
    //let libs = liboeffis.ld_args.iter().flat_map(|path| path.iter());

    let bindings = bindgen::Builder::default()
        .clang_args(includes)
        .header("src/wrapper.h")
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .generate()
        .expect("Unable to generate bindings");

    let out_path = PathBuf::from(env::var("OUT_DIR").unwrap());

    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("Couldn't write bindings!");
}
