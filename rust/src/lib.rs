use wasm_bindgen::prelude::*;
// use wasm_bindgen::JsCast;
// use js_sys::Object;
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
pub fn add(a: f32, b: f32) -> f32 {
    a + b
}

// Structs
// #[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct PersonTwo {
    pub name: String,
    pub age: u8,
}

// #[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct AgeDoubled {
    pub name: String,
    pub age: u8,
}

#[wasm_bindgen]
pub fn double_age(val: JsValue) -> Result<JsValue, JsValue> {
    // let mut field1 = HashMap::new();
    // field1.insert(0, String::from("ex"));
    let person: PersonTwo = serde_wasm_bindgen::from_value(val)?;

    let newperson = AgeDoubled {
        age: person.age * 2,
        name: person.name,
    };

    Ok(serde_wasm_bindgen::to_value(&newperson)?)
}

// #[wasm_bindgen]
// pub fn double_age(person: PersonTwo) -> AgeDoubled {
//     let person = AgeDoubled {
//         age: person.age * 2,
//         name: person.name,
//     };
//     person
// }

// #[wasm_bindgen]
// extern "C" {
//     #[wasm_bindgen(typescript_type = "{ name: string }")]
//     pub type Person;

//     #[wasm_bindgen(method, getter)]
//     fn name(this: &Person) -> String;
// }

// #[wasm_bindgen]
// pub fn greet(person: JsValue) -> Result<JsValue, JsValue> {
//     let person: Person = person.dyn_into().map_err(|_| JsValue::from_str("Expected a Person object"))?;
//     let greeting = format!("Hello, {}!", person.name());
//     Ok(JsValue::from_str(&greeting))
// }

// function that takes in a person object when called from JS
// multiply the age by 2 and return the person object
// #[wasm_bindgen]
// pub fn double_age(person: JsValue) -> JsValue {
//     let person: Person = person.into_serde().unwrap();
//     let person = Person {
//         age: person.age * 2,
//         ..person
//     };
//     JsValue::from_serde(&person).unwrap()
// }