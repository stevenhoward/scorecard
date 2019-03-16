import React, { Component, CSSProperties, ReactNode } from 'react';
import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath, {BasePathProps} from './BasePath';
import OutcomeSelector, {SelectedOutcome} from './OutcomeSelector';

interface PlateAppearanceProps {
}

interface PlateAppearanceState {
  basepaths: BasePathProps[];
  dialogVisible: boolean;
  dialogContents?: ReactNode;

  outNumber?: number;

  outDescription?: string[];
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

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private resetUnreachedBases(basepaths: BasePathProps[]) {
    let reset = false;
    for (let i = 0; i < basepaths.length; ++i) {
      if (reset) {
        basepaths[i].reached = undefined;
        basepaths[i].result = undefined;
      }
      else if(basepaths[i].reached !== true) {
        reset = true;
      }
    }

    return basepaths;
  }

  clickPath(base: number) {
    // Ensure that clicking the path to, say, second base doesn't work if we
    // haven't reached first
    for (let i = 0; i < base; ++i) {
      if (this.state.basepaths[i].reached !== true) {
        return false;
      }
    }

    const self = this;
    function onSelectOutcome(outcome: SelectedOutcome) {
      const basepaths = self.state.basepaths.slice();

      if (!outcome.reached && base == 0) {
        // If the batter doesn't reach base at all, we write the way the out was
        // made in the middle.
        self.setState({
          outDescription: outcome.shorthand.split('\n'),
          outNumber: outcome.outs
        });

        basepaths[0].result = undefined;
        basepaths[0].reached = undefined;
      }
      else {
        if (!outcome.reached) {
          self.setState({ outNumber: outcome.outs });
        }
        else {
          self.setState({ outDescription: undefined, outNumber: undefined });
        }

        basepaths[base].result = outcome.shorthand;
        basepaths[base].reached = outcome.reached;

        if (outcome.bases !== undefined) {
          let i = base + 1;
          for (; i < base + outcome.bases; ++i) {
            basepaths[i].reached = true;

            // when the runner advances more than one base from the same play,
            // e.g. an extra-base hit, we only label the first basepath
            basepaths[i].result = '';
          }
        }
      }

      self.setState({ basepaths: self.resetUnreachedBases(basepaths) });
      self.closeDialog();
    }

    const dialogContents = <OutcomeSelector base={base} onSelectOutcome={onSelectOutcome} />;
    this.setState({ dialogVisible: true, dialogContents: dialogContents });
  }

  private renderOutDescription() {
    if (this.state.outDescription) {
      // Vertically center the multiline text
      const offset = this.state.outDescription.length * 15 / 2;
      return (
        <text className="out-description" x={50} y={50-offset}>
          { this.state.outDescription.map(desc => <tspan x={50} dy={15}>{desc}</tspan>) }
        </text>
      );
    }

    return null;
  }

  private renderOutIndicator() {
    if (this.state.outNumber) {
      return (
        <React.Fragment>
          <text className="out-indicator-text" x={5} y={95}>{this.state.outNumber}</text>
          <circle cx={5} cy={90} r="8" stroke="black" fill="none" />
        </React.Fragment>
      );
    }

    return null;
  }

  render() {
    const basePaths = this.state.basepaths.map(props => <BasePath {...props} />);

    return (
      <React.Fragment>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="110" height="100"
          className="base-path-diagram">
          {basePaths}
          {this.renderOutDescription()}
          {this.renderOutIndicator()}
        </svg>
        <Dialog visible={this.state.dialogVisible} onClose={() => this.closeDialog()}>
          {this.state.dialogContents}
        </Dialog>
       </React.Fragment>
    );
  }
}
