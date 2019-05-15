import React, { Component } from 'react';

export interface OwnProps {
}

interface StateProps {
}

type LineupProps = OwnProps & StateProps;

export default class Lineup extends Component<LineupProps, {}> {
  render() {
    const slots = Array(9).fill(null).map((_, i) => {
      return (
        <div className="slot" key={i}>
          <span className="slotNumber">{i + 1}. </span>
          <input type="text" className="player-name" />
          <input type="text" className="jersey-number" pattern="\d{1,2}" />
        </div>
      );
    });

    return (
      <div className="lineup">
        <header>
          <span className="player-name">Player</span>
          <span className="jersey-number">#</span>
        </header>
        {slots}
      </div>
    );
  }
}
