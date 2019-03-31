import React, { Component } from 'react';
import './App.css';

import Diagram from './Diagram';
import Inning from './Inning';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Inning battingOrder={['#6', '#9', '#10', '#28', '#35', '#18', '#52', '#12', '#40']} />
      </div>
    );
  }
}

export default App;
