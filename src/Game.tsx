import React, { Component } from 'react';
import Inning from './Inning';

interface GameProps { }

export default function Game(props: GameProps) {
  return (
    <div>
      <Inning inningNumber={1} />
    </div>
  );
}
