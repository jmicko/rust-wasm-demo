import {add} from 'rust-wasm-demo';

async function main() {
  // await rust;
  // console.log('rust', rust);
  const sum = add(5.1, 3.7);
  console.log('sum', sum);
}

main();
