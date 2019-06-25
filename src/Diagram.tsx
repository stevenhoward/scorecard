import React, { Component, CSSProperties, ReactNode } from 'react';
import BasePath, {BasePathProps} from './BasePath';

// There are only two hard problems in computer science: Caching and naming
// things.
export interface DiagramLeg {
  label: string;

  reached: boolean;

  fragmentIndex: number;
}

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
  legs: DiagramLeg[];

  onBaseClicked: (base: number) => void;

  rbis: number;
}

function* statusFromReached(legs: DiagramLeg[], enabled: boolean) {
  let reachedPrevious = true;
  for (let i = 0; i < 4; ++i) {
    const reached = legs[i] ? legs[i].reached : undefined;
    if (reached === true) {
      yield 'safe';
    }
    else if (reached === false) {
      yield 'out';
      reachedPrevious = false;
    }
    else if (reachedPrevious && enabled) {
      yield 'interactive';
      reachedPrevious = false;
    }
    else {
      yield 'initial';
      reachedPrevious = false;
    }
  }

  // Solely to placate the type checker
  if (false) {
    yield 'did-not-reach';
  }
}

export default function Diagram(props: DiagramProps) {
  const { legs, outDescription, outNumber, rbis, enabled } = props;

  let outNumberFragment: ReactNode = null;
  if (outNumber) {
    outNumberFragment = (
      <React.Fragment>
        <text className="out-indicator-text" x={5} y={95}>{outNumber}</text>
        <circle cx={5} cy={90} r="8" stroke="black" fill="none" />
      </React.Fragment>
    );
  }

  const status = Array.from(statusFromReached(legs, enabled));

  let outDescriptionFragment: ReactNode = null;
  if (outDescription) {
    const description = ([] as string[]).concat(outDescription);
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

  const rbiCircles = [
    { cx: 90, cy: 90, r: 3, stroke: 'black', fill: 'none', key: 0 },
    { cx: 96, cy: 90, r: 3, stroke: 'black', fill: 'none', key: 1 },
    { cx: 90, cy: 96, r: 3, stroke: 'black', fill: 'none', key: 2 },
    { cx: 96, cy: 96, r: 3, stroke: 'black', fill: 'none', key: 3 },
  ];

  const rbisFragment = rbiCircles.slice(0, rbis)
    .map(circleProps => <circle {...circleProps} />);

  // Generates a function that calls props.onBaseClicked(base) if the previous
  // bases are filled in
  const genOnBaseClicked = (base: number) =>
    () => {
      if (status[base] != 'initial') {
          props.onBaseClicked(base);
      }
    };

  return (
    <svg viewBox="-10 0 120 100" xmlns="http://www.w3.org/2000/svg" width="110" height="100"
      className="base-path-diagram">

      <BasePath
        x1={50} y1={100} x2={100} y2={50}
        status={status[0]}
        result={legs[0] && legs[0].label}
        onClick={genOnBaseClicked(0)} />
      <BasePath
        x1={100} y1={50} x2={50} y2={0}
        status={status[1]}
        result={legs[1] && legs[1].label}
        onClick={genOnBaseClicked(1)} />
      <BasePath
        x1={50} y1={0} x2={0} y2={50}
        status={status[2]}
        result={legs[2] && legs[2].label}
        onClick={genOnBaseClicked(2)} />
      <BasePath
        x1={0} y1={50} x2={50} y2={100}
        status={status[3]}
        result={legs[3] && legs[3].label}
        onClick={genOnBaseClicked(3)} />

      {outNumberFragment}
      {outDescriptionFragment}
      {rbisFragment}
    </svg>
  )
}

