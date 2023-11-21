# This is just nuts jeez oh man

I'm about to try to compile rust code to wasm and run it in node.js and nobody can stop me.

## How to run
Don't.

You should just compile the rust code like normal and run it as a regular binary.

However, if you have computationally intensive tasks that you want to run in the browser, compiling to wasm might offer a slight performance increase.

This is my attempt at demonstrating that.

## How to actually run it tho

Not sure on best practice here, but I need to write something here that I can reference later. I'll update later when I understand it better. The assumption is that you have rust and wasm-pack installed.

1. Compile the rust binary with `wasm-pack build --target nodejs`. You need to do this from within the `rust` directory. This will create a `pkg` directory with a few files in it. This is the package that npm will use to install the wasm module.

2. Install the wasm module with `npm install` from inside the `js` directory. This will install the wasm module into the `node_modules` directory.

3. Run the node script with `node index.js`. This will run the node script and call the wasm module.

## How to modify the rust code

1. Modify the rust code in `rust/src/lib.rs` or wherever.

2. Compile the rust code again with `wasm-pack build --target nodejs` inside the `rust` directory.

3. npm install again with `npm install` inside the `js` directory.
