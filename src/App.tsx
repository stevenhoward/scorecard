import React, { Component } from 'react';
import './App.css';

import Diagram from './Diagram';
import Inning from './Inning';

class App extends Component {
  render() {
    return (
      <div className="App">
        <fieldset>
          <legend>Interactive example</legend>
          <Inning battingOrder={[]} />
        </fieldset>

        <fieldset className="static">
          <legend>Static examples</legend>
          <Diagram outNumber={1} outDescription="K" results={[]} reached={[]} />
          <Diagram outNumber={2} results={['1B', '6-4']} reached={[true, false]} />
          <Diagram results={['FC']} reached={[true]} />
          <Diagram outNumber={3} outDescription="L8" results={[]} reached={[]} />
        </fieldset>
      </div>
    );
  }
}

export default App;
