import React, { Component, CSSProperties, ReactNode } from 'react';
import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath, {BasePathProps} from './BasePath';
import OutcomeSelector, {SelectedOutcome} from './OutcomeSelector';
import Diagram from './Diagram';

interface PlateAppearanceProps {
}

interface PlateAppearanceState {
  dialogVisible: boolean;
  dialogContents?: ReactNode;

  outNumber?: number;

  outDescription?: string[];

  reached: (boolean | undefined)[];
  results: (string | undefined)[];
}

export default class PlateAppearance extends Component<PlateAppearanceProps, PlateAppearanceState> {
  constructor(props: PlateAppearanceProps) {
    super(props);
    this.state = {
      dialogVisible: false,
      reached: ([] as boolean[]),
      results: ([] as string[]),
    };
  }

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private handleBaseClicked(base: number) {
    const onSelectOutcome = (outcome: SelectedOutcome) => {
      const reached = this.state.reached.slice();
      const results = this.state.results.slice();

      // Click '1B' on the first base line and it clears everything else
      for (let i = base + 1; i < 4; ++i) {
        reached[i] = undefined;
        results[i] = undefined;
      }

      if (outcome.bases) {
        for (let i = base + 1; i < base + outcome.bases; ++i) {
          reached[i] = true;
          results[i] = '';
        }
      }

      reached[base] = outcome.reached;
      results[base] = outcome.shorthand;

      this.setState({ reached: reached, results: results })
      this.closeDialog();
    }

    this.setState({
      dialogVisible: true,
      dialogContents: <OutcomeSelector base={base} onSelectOutcome={onSelectOutcome} />,
    })
  }

  render() {
    return (
      <React.Fragment>
        <Diagram
          outNumber={this.state.outNumber}
          outDescription={this.state.outDescription}
          reached={this.state.reached}
          results={this.state.results}
          onBaseClicked={this.handleBaseClicked.bind(this)} />
        <Dialog visible={this.state.dialogVisible} onClose={this.closeDialog.bind(this)}>
          {this.state.dialogContents}
        </Dialog>
      </React.Fragment>
    );

    /*
    return (
    );*/
  }
}
