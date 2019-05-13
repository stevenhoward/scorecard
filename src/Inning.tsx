import React, { Component } from 'react';
import {connect} from 'react-redux';
import PlateAppearance from './PlateAppearance';
import {AppState, Play, PlayFragment} from './redux/types';
import {getCurrentInning} from './redux/selectors';

interface InningProps {
  plays: Play[]

  inningNumber: number;
}

class Inning extends Component<InningProps, {}> {
  private renderStatistics() {
    const { plays } = this.props;
    const hits = plays.filter(play => play.hit).length;
    const totalBases = plays.flatMap(p => p.fragments).reduce(
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
    const { inningNumber, plays } = this.props;
    const fragments: PlayFragment[] = plays.flatMap(p => p.fragments);

    const outs = fragments
      .filter(f => f.bases === 0)
      .map(f => f.runnerIndex)
      .reduce((map, runnerIndex) => {
        map.set(runnerIndex, map.size + 1);
        return map;
      }, new Map<number, number>());

    const maxIndex = fragments.length
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
    plays: getCurrentInning(state),
  };
}

export default connect(mapStateToProps)(Inning);
