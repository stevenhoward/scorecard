import React, {ReactNode} from 'react';

interface Rect {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

// Calculate where the labels go with respect to each base path
function getLabelPosition(props: Rect) {
  const x1 = props.x1, y1 = props.y1, x2 = props.x2, y2 = props.y2;

  // Midpoint is at <ax, ay>
  const ax = (x1 + x2) / 2, ay = (y1 + y2) / 2;

  // Offset: The position <ax, ay> gives us the bottom-left corner of the text
  // box on the base path. We need to move it left for text left of center, and down for
  // text below the middle.
  const ox = ax < 50 ? -2 : 2, oy = ay < 50 ? 0 : 8;

  const anchor = ax < 50 ? 'end' : 'start';

  return {x: ax + ox, y: ay + oy, anchor: anchor};
}

export interface BasePathProps extends Rect {
  result?: string;
  reached?: boolean;
  handleClick: ()=>void;
}

export default function BasePath(props: BasePathProps) {
  const x1 = props.x1, y1 = props.y1, x2 = props.x2, y2 = props.y2;
  const width = Math.abs(x1 - x2);
  const height = Math.abs(y1 - y2);
  const xmin = Math.min(x1, x2);
  const ymin = Math.min(y1, y2);

  const labelPosition = getLabelPosition(props);

  let baseLine: ReactNode;
  if (props.reached === true) {
    // When the player reaches a base, shade that line darker
    baseLine = <line x1={x1} y1={y1} x2={x2} y2={y2} className="base-line-did-reach" />;
  }
  else if(props.reached === false) {
    // When the player doesn't reach a base (except first), draw half the line
    // and a perpendicular stub at the end
    const ax = (x1 + x2) / 2, ay = (y1 + y2) / 2;
    const orthx = y2 - y1, orthy = x2 - x1;
    const scale = 0.05;

    baseLine = (
      <React.Fragment>
        <line x1={x1} y1={y1} x2={ax} y2={ay} className="base-line-did-not-reach" />
        <line x1={ax + orthx * scale} y1={ay - orthy * scale}
              x2={ax - orthx * scale} y2={ay + orthy * scale}
              className="base-line-did-not-reach" />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="base-line-unfilled" />
      {baseLine}
      <text x={labelPosition.x} y={labelPosition.y} textAnchor={labelPosition.anchor}>{props.result}</text>
      <rect fillOpacity="0" x={xmin} y={ymin} width={width} height={height} onClick={props.handleClick} />
    </React.Fragment>
  );
}

