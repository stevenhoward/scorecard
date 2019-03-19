import React, { Component, CSSProperties, ReactNode } from 'react';
import BasePath, {BasePathProps} from './BasePath';

interface DiagramProps {
  // If there was an out, we indicate whether this is the first, second, or
  // third of the inning
  outNumber?: number;

  // If the runner didn't reach first, the out goes in the middle, and can use
  // multiple lines. Otherwise, out descriptions go on the base line.
  outDescription?: string | string[];

  results: (string | undefined)[];
  reached: (boolean | undefined)[];

  onBaseClicked?: (base: number) => void;
}

export default function Base(props: DiagramProps) {
  let outNumberFragment: ReactNode = null;
  if (props.outNumber) {
    outNumberFragment = (
      <React.Fragment>
        <text className="out-indicator-text" x={5} y={95}>{props.outNumber}</text>
        <circle cx={5} cy={90} r="8" stroke="black" fill="none" />
      </React.Fragment>
    );
  }

  let outDescriptionFragment: ReactNode = null;
  if (props.outDescription) {
    const description = ([] as string[]).concat(props.outDescription);
    // Vertically center the multiline text
    const offset = description.length * 15 / 2;
    outDescriptionFragment = (
      <text className="out-description" x={50} y={50-offset}>
        { description.map(desc => <tspan x={50} dy={15}>{desc}</tspan>) }
      </text>
    );
  }

  // Generates a function that calls props.onBaseClicked(base) if the previous
  // bases are filled in
  const genOnBaseClicked = (base: number) =>
    () => {
      if (props.onBaseClicked !== undefined) {
        // check: are we on the previous base?
        for (let i = base - 1; i > 0; --i) {
          if (!props.reached[i]) { return; }
        }

        // check: clicking a basepath that was an extra base from whatever
        // happened before shouldn't work
        if (props.results[base] === '') { return; }

        props.onBaseClicked(base);
      }
    };

  // order matters: we want to preserve 'false' values as distinct from
  // 'undefined'
  const reachedHome = props.reached[3];
  const reachedThird = reachedHome || props.reached[2];
  const reachedSecond = reachedThird || props.reached[1];
  const reachedFirst = reachedSecond || props.reached[0];

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="110" height="100"
      className="base-path-diagram">

      <BasePath
        x1={50} y1={100} x2={100} y2={50}
        reached={reachedFirst} result={props.results[0]}
        handleClick={genOnBaseClicked(0)} />
      <BasePath
        x1={100} y1={50} x2={50} y2={0}
        reached={reachedSecond} result={props.results[1]}
        handleClick={genOnBaseClicked(1)} />
      <BasePath
        x1={50} y1={0} x2={0} y2={50}
        reached={reachedThird} result={props.results[2]}
        handleClick={genOnBaseClicked(2)} />
      <BasePath
        x1={0} y1={50} x2={50} y2={100}
        reached={reachedHome} result={props.results[3]}
        handleClick={genOnBaseClicked(3)} />

      {outNumberFragment}
      {outDescriptionFragment}
    </svg>
  )
}

