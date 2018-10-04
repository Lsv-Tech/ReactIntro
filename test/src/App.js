import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import CButton from './components/button.js';

class App extends Component {

    static dummyClickEventCllbk() {
        alert("Hi I'm a callback :D")
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <CButton className='c-btn' clickCallback={App.dummyClickEventCllbk}>Click me!</CButton>
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
}

export default App;
