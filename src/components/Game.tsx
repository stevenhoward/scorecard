import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Play } from '../redux/types';
import { getGameStatus, getPlaysByInning } from '../redux/selectors';
import Inning from './Inning';
import InningStatistics from './InningStatistics';
import Lineup from './Lineup';
import BatterStatistics from './BatterStatistics';

export interface OwnProps {}

interface StateProps {
  innings: Play[][];
  gameStatus: string;
}

type GameProps = OwnProps & StateProps;

class Game extends Component<StateProps, {}> {
  render() {
    const { gameStatus, innings } = this.props;
    const numInnings = Math.max(innings.length, 9);

    const inningFragments = Array(numInnings).fill(null).map((_, i) => (
      <div className="inning-container" key={i}>
        <Inning inningNumber={i} />
        <InningStatistics inningNumber={i} />
      </div>
    ));

    return (
      <React.Fragment>
        <div className="game-status">{gameStatus}</div>
        <div className="game">
          <Lineup />
          {inningFragments}
          <BatterStatistics />
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps({ present: state } : { present: AppState }): StateProps {
  return {
    innings: getPlaysByInning(state),
    gameStatus: getGameStatus(state),
  };
}

export default connect(mapStateToProps)(Game);
