import React, { Component, CSSProperties, ReactNode } from 'react';
import { connect } from 'react-redux';

import { AppState, Play, PlayFragment, PlayOutcome } from '../redux/types';
import { addPlay } from '../redux/actions';
import { getFragmentsByBatter, getOutsByBatter } from '../redux/selectors';

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

  // length from 0-4 corresponding to each base path
  legs: DiagramLeg[];

  // Number displayed on the bottom left. 1, 2, or 3, if present
  outNumber?: number;

  // If the player didn't reach base, the display is different.
  outDescription?: string | string[];
}

interface DispatchProps {
  //
  addPlay: (fragment: PlayOutcome) => void;
}

type PlateAppearanceProps = OwnProps & StateProps & DispatchProps;

interface PlateAppearanceState {
  dialogVisible: boolean;
  dialogContents?: ReactNode;
}

// One-to-one correspondence with Diagram.
// PlateAppearance concerns itself with routing interaction and displaying
// dialogs.
class PlateAppearance extends Component<PlateAppearanceProps, PlateAppearanceState> {
  state: PlateAppearanceState;

  constructor(props: PlateAppearanceProps) {
    super(props);
    this.state = { dialogVisible: false };
  }

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private handleBaseClicked(base: number) {
    const { legs, addPlay, index, outNumber } = this.props;

    if (!outNumber && legs.length <= base) {
      const addPlayWrap = (outcome: PlayOutcome) => {
        addPlay({ runnerIndex: index, ...outcome });
        this.closeDialog();
      };

      const dialogVisible = true;
      const dialogContents = <PlaySelector addPlay={addPlayWrap} index={index} onBase={base !== 0} />;

      this.setState({ dialogVisible, dialogContents });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Diagram
          outNumber={this.props.outNumber}
          outDescription={this.props.outDescription}
          legs={this.props.legs}
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

// fragments gives us play-by-play data in the format most useful for the game
// as a whole, i.e. in chronologically-ordered chunks.
function normalizeFragments(fragments: PlayFragment[]) {
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

function mapStateToProps({ present: state } : { present: AppState }, ownProps: OwnProps) : StateProps {
  const fragments = getFragmentsByBatter(state).get(ownProps.index) || [];
  const outNumber = getOutsByBatter(state)[ownProps.index];
  const normalizedProps = normalizeFragments(fragments);

  return { fragments, outNumber, ...normalizedProps };
}

export default connect(mapStateToProps, {addPlay})(PlateAppearance);
