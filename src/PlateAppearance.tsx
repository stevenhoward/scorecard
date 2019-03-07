import React, { Component, CSSProperties, ReactNode } from 'react';

interface SelectionProps {

}

function PlateAppearanceSelection(props: SelectionProps) {

}

/*
enum BasePathResult {
    // From home plate only
    Single,
    Double,
    Triple,
    HomeRun,
    HitByPitch,

    // From anywhere
    FieldingError,
    BaseOnBalls,
    WildPitch,
    PassedBall,

    // From on base only
    StolenBase,
    CaughtStealing,
    ForceOut,
}*/

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
  const ox = ax < 50 ? -25 : 5, oy = ay < 50 ? 0 : 10;

  return {x: ax + ox, y: ay + oy};
}

interface BasePathProps extends Rect {
  result?: string;
  handleClick: ()=>void;
}

function BasePath(props: BasePathProps) {
  const x1 = props.x1, y1 = props.y1, x2 = props.x2, y2 = props.y2;
  const width = Math.abs(x1 - x2);
  const height = Math.abs(y1 - y2);
  const xmin = Math.min(x1, x2);
  const ymin = Math.min(y1, y2);

  const labelPosition = getLabelPosition(props);

  return (
    <React.Fragment>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" />
      <text x={labelPosition.x} y={labelPosition.y}>{props.result}</text>
      <rect fill-opacity="0" x={xmin} y={ymin} width={width} height={height} onClick={props.handleClick} />
    </React.Fragment>
  );
}

interface DialogProps {
  visible: boolean;
  onClose: ()=>void;
  children?: ReactNode;
}

function Dialog(props: DialogProps) {
  if (!props.visible) {
    return null;
  }

  const backdropStyle: CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  const foregroundStyle: CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 20,
    width: 300,
    height: 300,
    margin: '0 auto',
  };

  return (
    <div style={backdropStyle}>
      <div style={foregroundStyle}>
        {props.children}
        <footer>
          <button onClick={props.onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}

interface PlateAppearanceProps {}

interface PlateAppearanceState {
  basepaths: BasePathProps[];
  dialogVisible: boolean;
  dialogContents?: ReactNode;
}

export default class PlateAppearance extends Component<PlateAppearanceProps, PlateAppearanceState> {
  constructor(props: PlateAppearanceProps) {
    super(props);
    this.state = {
      basepaths: [
        { x1: 50, y1: 100, x2: 100, y2: 50, handleClick: () => this.clickPath(0) },
        { x1: 100, y1: 50, x2: 50, y2: 0, handleClick: () => this.clickPath(1) },
        { x1: 50, y1: 0, x2: 0, y2: 50, handleClick: () => this.clickPath(2) },
        { x1: 0, y1: 50, x2: 50, y2: 100, handleClick: () => this.clickPath(3) },
      ],
      dialogVisible: false,
    };
  }

  closeDialog(){
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  clickPath(base: number) {
    const self = this;
    function onSelectOutcome(outcome: string) {
      const basepaths = self.state.basepaths.slice();
      basepaths[base].result = outcome;
      self.setState({ basepaths: basepaths });
      self.closeDialog();
    }

    const selector = (outcome: string) => () => onSelectOutcome(outcome);

    const dialogContents = (
      <ul>
        <li onClick={selector('1B')}>Single</li>
        <li onClick={selector('2B')}>Double</li>
        <li onClick={selector('3B')}>Triple</li>
        <li onClick={selector('HR')}>Home Run</li>
        <li onClick={selector('BB')}>Base on Balls</li>
      </ul>
    );

    this.setState({ dialogVisible: true, dialogContents: dialogContents });
  }

  render() {
    const basePaths = this.state.basepaths.map(props => <BasePath {...props} />);
    return (
      <React.Fragment>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          {basePaths}
        </svg>
        <Dialog visible={this.state.dialogVisible} onClose={() => this.closeDialog()}>
          {this.state.dialogContents}
        </Dialog>
       </React.Fragment>
    );
  }
}
