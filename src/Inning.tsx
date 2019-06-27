import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Play, PlayFragment } from './redux/types';
import { getPlaysByInning, getTotalBasesByInning } from './redux/selectors';
import PlateAppearance from './PlateAppearance';

export interface OwnProps {
  // Zero-based index of this inning.
  inningNumber: number;
}

interface StateProps {
  enabled: boolean;

  // 0 for the top of the first.
  // -Infinity for an inning that hasn't started yet.
  startIndex: number;

  plays: Play[]
  fragments: PlayFragment[];
}

type InningProps = OwnProps & StateProps

class Inning extends Component<InningProps, {}> {
  render() {
    const { inningNumber, fragments, plays, startIndex } = this.props;

    const maxIndex = plays.length
      ? Math.max(...plays.map(play => play.index)) + 1
      : 0;

    // 9 cells with data = new column for 10th.
    const cells = Math.ceil((plays.length + 1) / 9) * 9;

    const plateAppearances = Array(cells).fill(null).map((_, i) => {
      let batterIndex = -Infinity;
      if (i < plays.length || i == plays.length && this.props.enabled) {
        batterIndex = i + startIndex;
      }

      return (<PlateAppearance
        rbis={plays[i] ? plays[i].rbis : 0}
        key={i}
        index={batterIndex}
        enabled={i <= maxIndex && this.props.enabled && batterIndex >= 0}
      />);
    });

    const columns = [];
    for (let i = 0; i < plateAppearances.length; i += 9) {
      let column = plateAppearances.slice(i, i + 9);
      const shiftIndex = 9 - startIndex % 9;
      column = [...column.slice(shiftIndex), ...column.slice(0, shiftIndex)];
      columns.push(<div className="inning-column" key={i}>{column}</div>);
    }

    return (
      // Nested under .inning-container with InningStatistics.
      <React.Fragment>
        <div className="inning-header">{inningNumber + 1}</div>
        <div className="inning-columns">
          {columns}
        </div>
      </React.Fragment>
    )
  }
}

function getStartIndex(playsByInning: Play[][], inningNumber: number) {
  if (inningNumber == 0) {
    // Start of the game means use the first index
    return 0;
  }

  // "+1" because there's a new empty array for an inning that has just started
  if (inningNumber + 1 > playsByInning.length) {
    // Inning hasn't happened yet and can't be interacted with
    return -Infinity;
  }

  const previousInning = playsByInning[inningNumber - 1];
  const lastPlay = previousInning[previousInning.length - 1];
  return lastPlay.index + 1;
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  const { inningNumber } = ownProps;

  const playsByInning = getPlaysByInning(state);
  const totalBasesByInning = getTotalBasesByInning(state);

  const startIndex = getStartIndex(playsByInning, inningNumber);
  const plays = playsByInning.length > inningNumber ? playsByInning[inningNumber] : [];

  const enabled = playsByInning.length == inningNumber + 1;

  const { fragments } = state;

  return { plays, startIndex, enabled, fragments };
}

export default connect(mapStateToProps)(Inning);
