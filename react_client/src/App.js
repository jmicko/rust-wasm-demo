import logo from './logo.svg';
import './App.css';
import init, {
  add, double_age
} from 'rust-wasm-demo';

await init();

function App() {
  const sum = add(5.1, 3.7);
  console.log('sum', sum);

  // console.log('PersonTwo', PersonTwo);

  // const person = new PersonTwo({name:'John', age: 30});
  const person2 = {name:'John', age: 35};
  console.log('person', person2);
  console.log('person.age', person2.age);

  const doubled_age = double_age(person2);
  console.log('doubled_age', doubled_age);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
