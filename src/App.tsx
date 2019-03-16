import React, { Component } from 'react';
import PlateAppearance from './PlateAppearance';
import SelectFielder from './SelectFielder';
import './App.css';

import Diagram from './Diagram';

class App extends Component {
  render() {
    return (
      <div className="App">
        <fieldset>
          <legend>Interactive example</legend>
          <PlateAppearance />
        </fieldset>

        <div>
          <Diagram outNumber={1} outDescription="K" results={[]} reached={[]} />
          <Diagram outNumber={2} results={['1B', '6-4']} reached={[true, false]} />
          <Diagram results={['FC']} reached={[true]} />
          <Diagram outNumber={3} outDescription="L8" results={[]} reached={[]} />
        </div>
      </div>
    );
  }
}

export default App;
