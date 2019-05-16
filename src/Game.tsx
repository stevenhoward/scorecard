import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Play } from './redux/types';
import { getPlaysByInning } from './redux/selectors';
import Inning from './Inning';
import Lineup from './Lineup';

export interface OwnProps {}

interface StateProps {
  innings: Play[][];
}

type GameProps = OwnProps & StateProps;

class Game extends Component<StateProps, {}> {
  render() {
    const { innings } = this.props;
    const numInnings = Math.max(innings.length, 9);

    return (
      <div className="game">
        <Lineup />
        { Array(numInnings).fill(null).map((_, i) => <Inning inningNumber={i} key={i} />) }
      </div>
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return { innings: getPlaysByInning(state) };
}

export default connect(mapStateToProps)(Game);
