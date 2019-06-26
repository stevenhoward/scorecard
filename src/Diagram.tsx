import React, { Component, CSSProperties, ReactNode } from 'react';
import BasePath, { BasePathProps, Status } from './BasePath';

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

function* statusFromReached(legs: DiagramLeg[], enabled: boolean) : IterableIterator<Status> {
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
}

function createOutDescriptionFragment(props: DiagramProps) {
  const { onBaseClicked, outDescription } = props;

  if (outDescription) {
    const description = ([] as string[]).concat(outDescription);
    // Vertically center the multiline text
    const offset = description.length * 15 / 2;
    return (
      <text className="out-description" x={50} y={50-offset}
      onClick={() => onBaseClicked(0)}>
        { description.map(desc => <tspan x={50} dy={15} key={desc}>{desc}</tspan>) }
      </text>
    );
  }

  return null;
}

function createOutNumberFragment(props: DiagramProps) {
  const { outNumber } = props;
  if (outNumber) {
    return (
      <React.Fragment>
        <text className="out-indicator-text" x={5} y={95}>{outNumber}</text>
        <circle cx={5} cy={90} r="8" stroke="black" fill="none" />
      </React.Fragment>
    );
  }

  return null;
}

function createRbisFragment(props: DiagramProps) {
  const { rbis } = props;

  const rbiCircles = [
    { cx: 90, cy: 90 },
    { cx: 96, cy: 90 },
    { cx: 90, cy: 96 },
    { cx: 96, cy: 96 },
  ];

  return rbiCircles.slice(0, rbis).map((circleProps, i) => (
    <circle {...circleProps} r={3} stroke="black" fill="none" key={i} />
  ));
}

function createBasePathFragments(props: DiagramProps) {
  const { enabled, legs, onBaseClicked, outDescription } = props;

  // 'did-not-reach' looks like 'initial', but you can click the base path to
  // clear it.
  const status: Status[] = outDescription ?
    ['did-not-reach', 'initial', 'initial', 'initial'] :
    [...statusFromReached(legs, enabled)];

  // These are the dimensions of the diagonal line in the diagram and the
  // invisible click target rectangle
  const basePathDimensions = [
    { x1: 50,  y1: 100,  x2: 100,  y2: 50 },
    { x1: 100,  y1: 50,  x2: 50,  y2: 0 },
    { x1: 50,  y1: 0,  x2: 0,  y2: 50 },
    { x1: 0,  y1: 50,  x2: 50,  y2: 100 },
  ];

  return Array(4).fill(null).map((_, i) => (
    <BasePath {...basePathDimensions[i]}
      status={status[i]}
      result={legs[i] && legs[i].label}
      onClick={() => { if (status[i] != 'initial') { onBaseClicked(i); } }}
      key={i}
    />
  ));
}

export default function Diagram(props: DiagramProps) {
  return (
    <svg viewBox="-10 0 120 100" xmlns="http://www.w3.org/2000/svg" width="110" height="100"
      className="base-path-diagram">

      {createBasePathFragments(props)}
      {createOutNumberFragment(props)}
      {createOutDescriptionFragment(props)}
      {createRbisFragment(props)}
    </svg>
  )
}

