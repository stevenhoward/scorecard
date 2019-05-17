import React, { Component } from 'react';
import {connect} from 'react-redux';
import PlateAppearance from './PlateAppearance';
import {AppState, Play, PlayFragment} from './redux/types';
import { getInningMeta, getPlaysByInning } from './redux/selectors';

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
  private renderStatistics() {
    const { plays, fragments } = this.props;
    const hits = plays.filter(play => play.hit).length;
    const totalBases = fragments.reduce(
      (rv, x) => {
        rv.set(x.runnerIndex, (rv.get(x.runnerIndex) || 0) + x.bases);
        return rv;
      },
      new Map<number, number>());

    const runs = [...totalBases.values()].filter(bases => bases == 4).length;

    return (
      <table className="statistics">
        <tbody>
          <tr>
            <th>Runs</th>
            <td>{runs}</td>
          </tr>

          <tr>
            <th>Hits</th>
            <td>{hits}</td>
          </tr>
        </tbody>
      </table>
    );
  }

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
      <div className="inning-container">
        <div className="inning-header">{inningNumber + 1}</div>
        <div className="inning-columns">
          {columns}
        </div>
        {this.renderStatistics()}
      </div>
    )
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  const inningMeta = getInningMeta(state);
  const playsByInning = getPlaysByInning(state);
  const { inningNumber } = ownProps;

  let startIndex = -Infinity;
  let plays: Play[] = [];

  if (playsByInning.length > inningNumber) {
    startIndex = inningNumber == 0
      ? 0
      : playsByInning[inningNumber - 1].slice(-1)[0].index + 1;

    plays = playsByInning[inningNumber];
  }

  const enabled = playsByInning.length == inningNumber + 1;

  const { fragments } = state;

  return { plays, startIndex, enabled, fragments };
}

export default connect(mapStateToProps)(Inning);
