import React, { Component } from 'react';
import { Provider } from 'react-redux';
import './App.css';

import Diagram from './Diagram';
import Inning from './Inning';

import {store} from './redux/store';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <Inning inningNumber={1} />
        </Provider>
      </div>
    );
  }
}

export default App;
