import logo from './logo.svg';
import './App.css';
import init, {add} from 'rust-wasm-demo';

await init();

function App() {
  const sum = add(5.1, 3.7);
  console.log('sum', sum);
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
