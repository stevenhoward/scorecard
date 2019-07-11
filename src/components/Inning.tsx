import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Play, PlayFragment } from '../redux/types';
import { getPlaysByInning, getTotalBasesByInning } from '../redux/selectors';
import PlateAppearance from './PlateAppearance';

export interface OwnProps {
  // Zero-based index of this inning.
  inningNumber: number;
}

interface StateProps {
  isCurrentInning: boolean;

  // For an active inning, this number is used to add new Plays.
  startIndex: number | null;

  plays: Play[]

  // Scenario: 3 up, 3 down in the first, and now is the start of the second.
  // We need to start filling in diagrams from where we left off vertically.
  // The 4-hole batter is up first, so this number is 3
  offset: number;
}

type InningProps = OwnProps & StateProps

class Inning extends Component<InningProps, {}> {
  render() {
    const { isCurrentInning, inningNumber, plays, offset, startIndex } = this.props;

    const maxIndex = plays.length ? plays[plays.length - 1].index + 1 : (startIndex || 0);

    // 9 cells with data = new column for 10th.
    const cells = Math.ceil((plays.length + 1) / 9) * 9;

    let key = 0;
    const past = plays.map(play => (
      <PlateAppearance rbis={play.rbis} index={play.index} enabled={isCurrentInning} key={key++} />
    ));

    let present: JSX.Element[] = [];
    if (isCurrentInning) {
      present.push(<PlateAppearance rbis={0} index={maxIndex} enabled={true} key={key++} />);
    }

    const padLength = cells - past.length - present.length;

    const future = Array(padLength).fill(null).map(() => (
      <PlateAppearance rbis={0} enabled={false} index={NaN} key={key++} />
    ));

    const plateAppearances = [...past, ...present, ...future];

    const columns = [];
    for (let i = 0; i < plateAppearances.length; i += 9) {
      let column = plateAppearances.slice(i, i + 9);

      // If the offset is 3, then the diagram at the top of the column will be
      // the 6th batter up.
      column = [...column.slice(9 - offset), ...column.slice(0, 9 - offset)];
      columns.push(<div className="inning-column" key={i}>{column}</div>);
    }

    return (
      // Nested under .inning-container with InningStatistics.
      <React.Fragment>
        <div className="inning-header">{inningNumber + 1}</div>
        <div className="inning-columns">{columns}</div>
      </React.Fragment>
    )
  }
}

// For the current inning
function getStartIndex(playsByInning: Play[][], inningNumber: number) {
  if (inningNumber == 0) {
    // Start of the game means use the first index
    return 0;
  }

  // "+1" because there's a new empty array for an inning that has just started
  if (inningNumber + 1 > playsByInning.length) {
    // Inning hasn't happened yet and can't be interacted with
    return null;
  }

  const previousInning = playsByInning[inningNumber - 1];
  const lastPlay = previousInning[previousInning.length - 1];
  return lastPlay.index + 1;
}

function mapStateToProps({ present: state } : { present: AppState }, ownProps: OwnProps) {
  const { inningNumber } = ownProps;

  const playsByInning = getPlaysByInning(state);
  const totalBasesByInning = getTotalBasesByInning(state);

  const startIndex = getStartIndex(playsByInning, inningNumber);
  const plays = playsByInning.length > inningNumber ? playsByInning[inningNumber] : [];

  const isCurrentInning = playsByInning.length == inningNumber + 1;

  // If startIndex is null, this inning is in the future and there's no need for
  // an offset.
  const offset = startIndex != null ? startIndex % 9 : 0;

  return { plays, startIndex, isCurrentInning, offset };
}

export default connect(mapStateToProps)(Inning);
