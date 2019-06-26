import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from './redux/types';
import { getPlaysByInning, getTotalBasesByInning } from './redux/selectors';

export interface OwnProps {
  inningNumber: number;
}

interface StateProps {
  hits?: number;
  runs?: number;
}

type InningStatsProps = OwnProps & StateProps;

class InningStatistics extends Component<InningStatsProps, {}> {
  render() {
    const { hits, runs } = this.props;

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
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  const { inningNumber } = ownProps;

  const playsByInning = getPlaysByInning(state);
  if (playsByInning.length > inningNumber) {
    const totalBases = getTotalBasesByInning(state)[inningNumber];
    const runs = [...totalBases.values()].filter(bases => bases == 4).length;

    const plays = playsByInning[inningNumber];
    const hits = plays.filter(play => play.hit).length;

    return { hits, runs };
  }

  return { };
}

export default connect(mapStateToProps)(InningStatistics);
