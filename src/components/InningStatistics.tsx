import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../redux/types';
import { getHitsByInning, getRunsByInning, getTotalBasesByInning } from '../redux/selectors';

export interface OwnProps {
  inningNumber: number;
}

interface StateProps {
  hits?: number;
  runs?: number;
  leftOn?: number;
}

type InningStatsProps = OwnProps & StateProps;

class InningStatistics extends Component<InningStatsProps, {}> {
  render() {
    const { hits, runs, leftOn } = this.props;

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

          <tr>
            <th>LoB</th>
            <td>{leftOn}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  const { inningNumber } = ownProps;

  const hitsByInning = getHitsByInning(state);
  const numInnings = hitsByInning.length;
  if (numInnings > inningNumber) {
    const runs = getRunsByInning(state)[inningNumber];
    const hits = hitsByInning[inningNumber];
    let leftOn: number | undefined;

    if (numInnings > inningNumber + 1) {
      const runners = getTotalBasesByInning(state)[inningNumber]
      leftOn = [...runners.values()].length;
    }

    return { hits, runs, leftOn };
  }

  return { };
}

export default connect(mapStateToProps)(InningStatistics);
