extern crate kodict;
extern crate libc;

use kodict::Dictionary;
use libc::c_char;
use std::ffi::CStr;
use std::ffi::CString;
use std::mem;
use std::path::Path;

#[no_mangle]
pub extern "C" fn createDictionaryFromFile(path: *const c_char) -> *mut Dictionary {
    let s = unsafe { CStr::from_ptr(path) };
    let dictionary = unsafe {
        mem::transmute(Box::new(Dictionary::create_from_file(Path::new(
            s.to_str().unwrap(),
        ))))
    };
    dictionary
}

#[no_mangle]
pub extern "C" fn createDictionaryFromWeb(thread_num: usize) -> *mut Dictionary {
    let dictionary = unsafe { mem::transmute(Box::new(Dictionary::create_from_web(thread_num))) };
    dictionary
}

#[no_mangle]
pub extern "C" fn find(ptr: *mut Dictionary, word: *const c_char) -> *const c_char {
    let s = unsafe { CStr::from_ptr(word) };
    let dictionary = unsafe { &mut *ptr };
    match dictionary.find(s.to_str().unwrap()) {
        Ok(item) => CString::new(
            format!(
                "{}\t{}\t{}\t{}",
                item.word,
                item.meaning,
                item.pos.join(","),
                item.category.join(",")
            ).as_bytes(),
        ).unwrap()
        .into_raw(),
        Err(_e) => CString::new(vec![]).unwrap().into_raw(),
    }
}

#[no_mangle]
pub extern "C" fn findAll(ptr: *mut Dictionary, word: *const c_char) -> *const c_char {
    let s = unsafe { CStr::from_ptr(word) };
    let dictionary = unsafe { &mut *ptr };
    match dictionary.find_all(s.to_str().unwrap()) {
        Ok(items) => CString::new(
            items
                .into_iter()
                .map(|item| {
                    format!(
                        "{}\t{}\t{}\t{}",
                        item.word,
                        item.meaning,
                        item.pos.join(","),
                        item.category.join(",")
                    )
                }).collect::<Vec<String>>()
                .join("\n")
                .as_bytes(),
        ).unwrap()
        .into_raw(),
        Err(_e) => CString::new(vec![]).unwrap().into_raw(),
    }
}

#[no_mangle]
pub extern "C" fn has(ptr: *mut Dictionary, word: *const c_char) -> bool {
    let s = unsafe { CStr::from_ptr(word) };
    let dictionary = unsafe { &mut *ptr };
    dictionary.has(&s.to_str().unwrap())
}

#[no_mangle]
pub extern "C" fn saveAsTsv(ptr: *mut Dictionary, path: *const c_char) {
    let s = unsafe { CStr::from_ptr(path) };
    let dictionary = unsafe { &mut *ptr };
    dictionary.save_as_tsv(Path::new(s.to_str().unwrap()));
}

#[no_mangle]
pub extern "C" fn size(ptr: *mut Dictionary) -> usize {
    let dictionary = unsafe { &mut *ptr };
    dictionary.size()
}
