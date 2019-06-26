import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from './redux/types';
import { getHitsByInning, getRunsByInning } from './redux/selectors';

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

  const hitsByInning = getHitsByInning(state);
  if (hitsByInning.length > inningNumber) {
    const runs = getRunsByInning(state)[inningNumber];
    const hits = hitsByInning[inningNumber];

    return { hits, runs };
  }

  return { };
}

export default connect(mapStateToProps)(InningStatistics);
