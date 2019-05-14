import React, { Component } from 'react';
import {connect} from 'react-redux';
import PlateAppearance from './PlateAppearance';
import {AppState, Play, PlayFragment} from './redux/types';
import { getCurrentInningPlays, getCurrentInningFragments } from './redux/selectors';

export interface OwnProps {
  inningNumber: number;
}

interface StateProps {
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
    const { inningNumber, fragments, plays } = this.props;

    const outs = fragments
      .filter(f => f.bases === 0)
      .map(f => f.runnerIndex)
      .reduce((map, runnerIndex) => {
        map.set(runnerIndex, map.size + 1);
        return map;
      }, new Map<number, number>());

    const maxIndex = plays.length
      ? Math.max(...plays.map(play => play.index)) + 1
      : 0;

    // 9 cells with data = new column for 10th.
    const cells = Math.ceil((maxIndex + 1) / 9) * 9;

    const plateAppearances = Array(cells).fill(null).map((_, i) =>
      <PlateAppearance
        outs={outs.get(i)}
        fragments={fragments.filter(f => f.runnerIndex == i)}
        rbis={plays[i] ? plays[i].rbis : 0}
        key={i}
        index={plays[i] ? plays[i].index : maxIndex}
        enabled={i <= maxIndex}
      />);

    const columns = [];
    for (let i = 0; i < plateAppearances.length; i += 9) {
      columns.push(<div className="inning-column" key={i}>{plateAppearances.slice(i, i + 9)}</div>);
    }

    return (
      <div className="inning-container">
        <div className="inning-header">{inningNumber}</div>
        <div className="inning-columns">
          {columns}
        </div>
        {this.renderStatistics()}
      </div>
    )
  }
}

function mapStateToProps(state: AppState) {
  return {
    plays: getCurrentInningPlays(state),
    fragments: getCurrentInningFragments(state),
  };
}

export default connect(mapStateToProps)(Inning);
