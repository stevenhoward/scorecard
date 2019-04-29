import React, { Component, CSSProperties, ReactNode } from 'react';
import BasePath, {BasePathProps} from './BasePath';

interface DiagramProps {
  // Is interaction enabled?
  enabled: boolean;

  // If there was an out, we indicate whether this is the first, second, or
  // third of the inning
  outNumber?: number;

  // If the runner didn't reach first, the out goes in the middle, and can use
  // multiple lines. Otherwise, out descriptions go on the base line.
  outDescription?: string | string[];

  // label for each base line
  results: (string | undefined)[];

  // did the runner reach each base?
  reached: (boolean | undefined)[];

  onBaseClicked: (base: number) => void;
}

function* statusFromReached(reached: (boolean | undefined)[]) {
  let reachedPrevious = true;
  for (let i = 0; i < 4; ++i) {
    const r = reached[i];
    if (r === true) {
      yield 'safe';
    }
    else if (r === false) {
      yield 'out';
      reachedPrevious = false;
    }
    else if (reachedPrevious) {
      yield 'interactive';
      reachedPrevious = false;
    }
    else {
      yield 'initial';
      reachedPrevious = false;
    }
  }
}

export default function Diagram(props: DiagramProps) {
  let outNumberFragment: ReactNode = null;
  if (props.outNumber) {
    outNumberFragment = (
      <React.Fragment>
        <text className="out-indicator-text" x={5} y={95}>{props.outNumber}</text>
        <circle cx={5} cy={90} r="8" stroke="black" fill="none" />
      </React.Fragment>
    );
  }

  const status = props.enabled ?
    Array.from(statusFromReached(props.reached)) :
    Array(4).fill('initial');

  let outDescriptionFragment: ReactNode = null;
  if (props.outDescription) {
    const description = ([] as string[]).concat(props.outDescription);
    // Vertically center the multiline text
    const offset = description.length * 15 / 2;
    outDescriptionFragment = (
      <text className="out-description" x={50} y={50-offset}
      onClick={() => props.onBaseClicked(0)}>
        { description.map(desc => <tspan x={50} dy={15} key={desc}>{desc}</tspan>) }
      </text>
    );

    status[0] = 'did-not-reach';
  }

  // Generates a function that calls props.onBaseClicked(base) if the previous
  // bases are filled in
  const genOnBaseClicked = (base: number) =>
    () => {
      if (status[base] != 'initial') {
          props.onBaseClicked(base);
      }
    };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="110" height="100"
      className="base-path-diagram">

      <BasePath
        x1={50} y1={100} x2={100} y2={50}
        status={status[0]}
        result={props.results[0]}
        handleClick={genOnBaseClicked(0)} />
      <BasePath
        x1={100} y1={50} x2={50} y2={0}
        status={status[1]}
        result={props.results[1]}
        handleClick={genOnBaseClicked(1)} />
      <BasePath
        x1={50} y1={0} x2={0} y2={50}
        status={status[2]}
        result={props.results[2]}
        handleClick={genOnBaseClicked(2)} />
      <BasePath
        x1={0} y1={50} x2={50} y2={100}
        status={status[3]}
        result={props.results[3]}
        handleClick={genOnBaseClicked(3)} />

      {outNumberFragment}
      {outDescriptionFragment}
    </svg>
  )
}

