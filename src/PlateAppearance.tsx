import React, { Component, CSSProperties, ReactNode } from 'react';
import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath, {BasePathProps} from './BasePath';
import OutcomeSelector, {SelectedOutcome} from './OutcomeSelector';

interface PlateAppearanceProps {}

interface PlateAppearanceState {
  basepaths: BasePathProps[];
  dialogVisible: boolean;
  dialogContents?: ReactNode;
  outDescription?: string;
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

  clickPath(base: number) {
    const self = this;
    function onSelectOutcome(outcome: SelectedOutcome) {
      const basepaths = self.state.basepaths.slice();

      if (outcome.outs === 0) {
        self.setState({ outDescription: undefined });
        basepaths[base].result = outcome.shorthand;
      }
      else {
        for (const path of basepaths) {
          path.result = '';
        }

        self.setState({ outDescription: outcome.shorthand });
      }

      self.setState({ basepaths: basepaths });
      self.closeDialog();
    }

    const dialogContents = <OutcomeSelector base={base} onSelectOutcome={onSelectOutcome} />;
    this.setState({ dialogVisible: true, dialogContents: dialogContents });
  }

  render() {
    const basePaths = this.state.basepaths.map(props => <BasePath {...props} />);
    let outDescription: ReactNode = null;
    let outIndicator: ReactNode = null;
    if (this.state.outDescription) {
      outDescription = <text className="out-description" x={50} y={50}>{this.state.outDescription}</text>;
      outIndicator = (
        <React.Fragment>
          <text className="out-indicator-text" x={5} y={95}>1</text>
          <circle cx={5} cy={90} r="8" stroke="black" fill="none" />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="110" height="100"
          className="base-path-diagram">
          {basePaths}
          {outDescription}
          {outIndicator}
        </svg>
        <Dialog visible={this.state.dialogVisible} onClose={() => this.closeDialog()}>
          {this.state.dialogContents}
        </Dialog>
       </React.Fragment>
    );
  }
}
