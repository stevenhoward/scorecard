import React, { Component } from 'react';
import { Provider } from 'react-redux';
import './App.css';

import Game from './Game';

import {store} from './redux/store';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <Game />
        </Provider>
      </div>
    );
  }
}

export default App;
