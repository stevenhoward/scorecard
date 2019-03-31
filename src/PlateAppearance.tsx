import React, { Component, CSSProperties, ReactNode } from 'react';
import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath, {BasePathProps} from './BasePath';
import OutcomeSelector, {SelectedOutcome} from './OutcomeSelector';
import Diagram from './Diagram';
import {PlayFragment} from './Play';

interface PlateAppearanceProps {
  enabled: boolean;
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
    // props gives us play-by-play data in the format most useful for the game
    // as a whole, i.e. in chronologically-ordered chunks.
    // state needs that data only in terms of which bases a player reached and
    // how.
    const fragments = props.fragments;

    let outDescription: (string | undefined);
    let outNumber: (number | undefined);
    const reached = [];
    const results = [];

    if (fragments.length == 1 && fragments[0].bases === 0) {
      // simple out, did not reach base.
      outDescription = fragments[0].label;
      outNumber = props.outsBefore + 1;
    }
    else {
      for (const f of fragments) {
        reached.push(f.bases > 0);
        results.push(f.label);

        // Additional bases get a line but not a label
        for (let i = 1; i < f.bases; ++i) {
          reached.push(true);
          results.push('');
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
          onBaseClicked={this.handleBaseClicked.bind(this)}
          enabled={this.props.enabled}
        />

        <Dialog visible={this.state.dialogVisible} onClose={this.closeDialog.bind(this)}>
          {this.state.dialogContents}
        </Dialog>
      </React.Fragment>
    );
  }
}
