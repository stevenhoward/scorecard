import React, { Component, CSSProperties, ReactNode } from 'react';
import { connect } from 'react-redux';

import { AppState, Play, PlayFragment } from './redux/types';
import { addPlay, clearFrom } from './redux/actions';
import { getFragmentsByBatter, getOutsByBatter } from './redux/selectors';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath from './BasePath';
import PlaySelector from './PlaySelector';
import Diagram, { DiagramLeg } from './Diagram';

export interface OwnProps {
  // Can the user interact with this plate appearance?
  enabled: boolean;

  // Did the batter drive in runs?
  rbis: number;

  // Batter index, zero-based from the top of the first.
  index: number;
}

interface StateProps {
  // Play fragments for this player
  fragments: PlayFragment[];

  outNumber?: number;
}

interface DispatchProps {
  //
  addPlay: (fragment: PlayFragment) => void;

  // User clicks a base in the diagram,
  clearFrom: (fragmentIndex: number) => void;
}

type PlateAppearanceProps = OwnProps & StateProps & DispatchProps;

interface PlateAppearanceState {
  dialogVisible: boolean;
  dialogContents?: ReactNode;

  outDescription?: string[];

  legs: DiagramLeg[];
}

class PlateAppearance extends Component<PlateAppearanceProps, PlateAppearanceState> {
  state: PlateAppearanceState;

  constructor(props: PlateAppearanceProps) {
    super(props);
    this.state = {
      dialogVisible: false,
      legs: [],
    };
  }

  // TODO: move logic into mapStateToProps
  static getDerivedStateFromProps(props: PlateAppearanceProps, state: PlateAppearanceState) {
    // props gives us play-by-play data in the format most useful for the game
    // as a whole, i.e. in chronologically-ordered chunks.
    // state needs that data only in terms of which bases a player reached and
    // how.
    const { fragments } = props;

    let outDescription: (string | undefined);
    const legs: DiagramLeg[] = [];

    const [ firstFragment ] = fragments;
    if (fragments.length == 1 && firstFragment.bases === 0) {
      // simple out, did not reach base.
      outDescription = firstFragment.label;
    }
    else {
      for (const fragment of fragments) {
        let { bases, label, fragmentIndex } = fragment;

        legs.push({ reached: bases > 0, label, fragmentIndex });

        // Additional bases get a line but not a label
        for (let i = 1; i < bases; ++i) {
          legs.push({ reached: bases > 0, label: '', fragmentIndex });
        }
      }
    }

    return { legs, outDescription };
  }

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private handleBaseClicked(base: number) {
    const { legs } = this.state;

    if (legs.length > base) {
      this.props.clearFrom(legs[base].fragmentIndex);
    }
    else if (base === 0 && this.props.outNumber) {
      this.props.clearFrom(this.props.fragments[0].fragmentIndex);
    }
    else {
      const addPlay = (outcome: PlayFragment) => {
        this.props.addPlay({ runnerIndex: this.props.index, ...outcome });
        this.closeDialog();
      };

      const dialogVisible = true;
      const dialogContents = <PlaySelector
        addPlay={addPlay}
        index={this.props.index}
        onBase={base !== 0} />;

      this.setState({ dialogVisible, dialogContents });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Diagram
          outNumber={this.props.outNumber}
          outDescription={this.state.outDescription}
          legs={this.state.legs}
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

function mapStateToProps(state: AppState, ownProps: OwnProps) : StateProps {
  const fragments = getFragmentsByBatter(state).get(ownProps.index) || [];
  const outNumber = getOutsByBatter(state)[ownProps.index];

  return { fragments, outNumber };
}

export default connect(mapStateToProps, {addPlay, clearFrom})(PlateAppearance);
