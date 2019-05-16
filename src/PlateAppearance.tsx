import React, { Component, CSSProperties, ReactNode } from 'react';
import { connect } from 'react-redux';

import { AppState, Play, PlayFragment } from './redux/types';
import { addPlay, clearFrom } from './redux/actions';
import { getFragmentIndexesByBatter } from './redux/selectors';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';
import BasePath from './BasePath';
import PlaySelector from './PlaySelector';
import Diagram, { DiagramLeg } from './Diagram';

export interface OwnProps {
  // Can the user interact with this plate appearance?
  enabled: boolean;

  // If this runner recorded an out, which one was it?
  outs: number | undefined;

  rbis: number;

  // Batter index, zero-based from the top of the first.
  index: number;
}

interface StateProps {
  // All fragments in the game
  fragments: PlayFragment[];

  // The play fragments describing just this player's motion on the base paths
  fragmentIndexes: number[];
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

  outNumber?: number;

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
    const { fragmentIndexes, fragments: allFragments } = props;

    let outDescription: (string | undefined);
    let outNumber: (number | undefined);
    const legs: DiagramLeg[] = [];

    const [ firstIndex ] = fragmentIndexes
    if (fragmentIndexes.length == 1 && allFragments[firstIndex].bases === 0) {
      // simple out, did not reach base.
      outDescription = allFragments[firstIndex].label;
      outNumber = props.outs;
    }
    else {
      for (const fragmentIndex of fragmentIndexes) {
        const f = allFragments[fragmentIndex];
        let { bases, label } = f;
        if (bases == 0) {
          outNumber = props.outs;
        }

        legs.push({ reached: bases > 0, label, fragmentIndex });

        // Additional bases get a line but not a label
        for (let i = 1; i < f.bases; ++i) {
          legs.push({ reached: bases > 0, label: '', fragmentIndex });
        }
      }
    }

    return { legs, outDescription, outNumber, };
  }

  closeDialog() {
    this.setState({ dialogVisible: false, dialogContents: null });
  }

  private handleBaseClicked(base: number) {
    const { legs } = this.state;

    if (this.state.legs.length > base || base == 0 && this.state.outNumber) {
      const { fragmentIndex } = legs[base];
      this.props.clearFrom(fragmentIndex);
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
  const fragmentIndexes = getFragmentIndexesByBatter(state).get(ownProps.index) || [];
  const { fragments } = state;

  return { fragmentIndexes, fragments };
}

export default connect(mapStateToProps, {addPlay, clearFrom})(PlateAppearance);
