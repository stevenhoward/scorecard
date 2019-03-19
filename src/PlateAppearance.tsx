import React, { Component, CSSProperties, ReactNode } from 'react';
import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath, {BasePathProps} from './BasePath';
import OutcomeSelector, {SelectedOutcome} from './OutcomeSelector';
import Diagram from './Diagram';
import {PlayFragment} from './Play';

interface PlateAppearanceProps {
  outsBefore: number;
  onPlayFragment: (fragment: PlayFragment) => void;
  onClearFragment: (base: number) => void;
  fragments: PlayFragment[];
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

  static getDerivedStateFromProps(props: PlateAppearanceProps, state: PlateAppearanceState) {
    const fragments = props.fragments;

    let outDescription: (string | undefined);
    let outNumber: (number | undefined);
    const reached = [];
    const results = [];

    if (fragments.length == 1 && fragments[0].bases === 0) {
      outDescription = fragments[0].label;
      outNumber = props.outsBefore + 1;
    }
    else {
      for (let i = 0; i < fragments.length; ++i) {
        const f = fragments[i];

        if (f.bases === 0) {
          reached.push(false);
          results.push(f.label);
        }
        else {
          reached.push(true);
          results.push(f.label);

          for (let j = 1; j < f.bases; ++j) {
            reached.push(true);
            results.push('');
          }
        }
      }
    }

    return {
      reached: reached,
      results: results,
      outDescription: outDescription,
      outNumber: outNumber,
    };
  }

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private handleBaseClicked(base: number) {
    if (this.state.reached.length > base || base == 0 && this.state.outNumber) {
      this.props.onClearFragment(base);
    }
    else {
      const onSelectOutcome = (outcome: SelectedOutcome) => {
        this.props.onPlayFragment({
          bases: outcome.bases || 0,
          label: outcome.shorthand,
        });

        this.closeDialog();
      }

      this.setState({
        dialogVisible: true,
        dialogContents: <OutcomeSelector base={base} onSelectOutcome={onSelectOutcome} />,
      });
    }
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
  }
}
