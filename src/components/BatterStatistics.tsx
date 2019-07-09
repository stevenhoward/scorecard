import React, { Component } from 'react';
import { connect } from 'react-redux'
import { BatterStatsEntry, getStatisticsByBatter } from '../redux/selectors'
import { AppState } from '../redux/types';

interface OwnProps { }

interface StateProps {
  batters: BatterStatsEntry[];
}

type BatterStatisticsProps = OwnProps & StateProps;

class BatterStatistics extends Component<BatterStatisticsProps, {}> {
  private* renderRows() {
    let i = 0;
    for (const batter of this.props.batters) {
      const { hits, runs, atBats, rbis } = batter;
      yield (
        <div className="batter-stats-row" key={i++}>
          <span key="AB">{atBats}</span>
          <span key="H">{hits}</span>
          <span key="R">{runs}</span>
          <span key="RBI">{rbis}</span>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="batter-stats-container">
        <div className="batter-stats-header">
          <span key="AB">AB</span>
          <span key="H">H</span>
          <span key="R">R</span>
          <span key="RBI">RBI</span>
        </div>
        {[...this.renderRows()]}
      </div>
    );
  }
}

function mapStateToProps(state: AppState) : StateProps {
  return { batters: getStatisticsByBatter(state) };
}

export default connect(mapStateToProps)(BatterStatistics);
