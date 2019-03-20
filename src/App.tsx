import React, { Component } from 'react';
import './App.css';

import Diagram from './Diagram';
import Inning from './Inning';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Inning battingOrder={['#22', '#9', '#2']} />
      </div>
    );
  }
}

export default App;
