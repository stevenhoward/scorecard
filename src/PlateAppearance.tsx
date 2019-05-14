import React, { Component, CSSProperties, ReactNode } from 'react';
import { connect } from 'react-redux';

import { Play, PlayFragment } from './redux/types';
import { addPlay, clearFrom } from './redux/actions';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath from './BasePath';
import PlaySelector from './PlaySelector';
import Diagram from './Diagram';

export interface OwnProps {
  // Can the user interact with this plate appearance?
  enabled: boolean;

  // If this runner recorded an out, which one was it?
  outs: number | undefined;

  // The play fragments describing just this player's motion on the base paths
  fragments: PlayFragment[];

  rbis: number;

  // Batter index, zero-based from the top of the first.
  index: number;
}

interface DispatchProps {
  //
  addPlay: (fragment: PlayFragment) => void;

  // User clicks a base in the diagram,
  clearFrom: typeof clearFrom;
}

type PlateAppearanceProps = OwnProps & DispatchProps;

interface PlateAppearanceState {
  dialogVisible: boolean;
  dialogContents?: ReactNode;

  outNumber?: number;

  outDescription?: string[];

  reached: (boolean | undefined)[];
  results: (string | undefined)[];
}

class PlateAppearance extends Component<PlateAppearanceProps, PlateAppearanceState> {
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
    const { fragments } = props;

    let outDescription: (string | undefined);
    let outNumber: (number | undefined);
    const reached = [];
    const results = [];

    if (fragments.length == 1 && fragments[0].bases === 0) {
      // simple out, did not reach base.
      outDescription = fragments[0].label;
      outNumber = props.outs;
    }
    else {
      for (const f of fragments) {
        if (f.bases == 0) {
          outNumber = props.outs;
        }

        reached.push(f.bases > 0);
        results.push(f.label);

        // Additional bases get a line but not a label
        for (let i = 1; i < f.bases; ++i) {
          reached.push(true);
          results.push('');
        }
      }
    }

    return { reached, results, outDescription, outNumber, };
  }

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private handleBaseClicked(base: number) {
    if (this.state.reached.length > base || base == 0 && this.state.outNumber) {
      this.props.clearFrom(this.props.index, base);
    }
    else {
      const addPlay = (outcome: PlayFragment) => {
        this.props.addPlay({ runnerIndex: this.props.index, ...outcome });
        this.closeDialog();
      };

      const dialogContents = <PlaySelector
        addPlay={addPlay}
        index={this.props.index}
        onBase={base !== 0} />;

      this.setState({
        dialogVisible: true,
        dialogContents
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
          rbis={this.props.rbis}
        />

        <Dialog visible={this.state.dialogVisible} onClose={this.closeDialog.bind(this)}>
          {this.state.dialogContents}
        </Dialog>
      </React.Fragment>
    );
  }
}

export default connect<{}, DispatchProps, OwnProps>(undefined, {addPlay, clearFrom})
  (PlateAppearance);
