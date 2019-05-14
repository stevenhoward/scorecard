import React, { Component } from 'react';
import Inning from './Inning';
import Lineup from './Lineup';

interface GameProps { }

export default function Game(props: GameProps) {
  return (
    <div className="game">
      <Lineup />
      <Inning inningNumber={1} />
    </div>
  );
}
