import React, { Component } from 'react';
import { connect } from 'react-redux';

// @ts-ignore
import { ActionCreators } from 'redux-undo';
import { AppState, Play } from '../redux/types';
import { getGameStatus, getPlaysByInning } from '../redux/selectors';
import { toggleDisplayTeam } from '../redux/actions';
import Inning from './Inning';
import InningStatistics from './InningStatistics';
import Lineup from './Lineup';
import BatterStatistics from './BatterStatistics';

export interface OwnProps {}

interface StateProps {
  innings: Play[][];
  gameStatus: string;
  displayTeam: string;

  canUndo: boolean;
  canRedo: boolean;
}

interface DispatchProps {
  undo: () => void;
  redo: () => void;
  toggleDisplayTeam: () => void;
}

type GameProps = OwnProps & StateProps & DispatchProps;

class Game extends Component<GameProps, {}> {
  private createUndoRedo() {
    const { canUndo, canRedo, undo, redo } = this.props;

    return (
      <div>
        <button onClick={undo} disabled={!canUndo} key='undo'>undo</button>
        <button onClick={redo} disabled={!canRedo} key='redo'>redo</button>
      </div>
    );
  }

  private createTeamToggle() {
    const { displayTeam, toggleDisplayTeam } = this.props;
    const homeStyle: any = { fontWeight: displayTeam == 'home' ? 'bold' : 'normal' };
    const awayStyle: any = { fontWeight: displayTeam == 'away' ? 'bold' : 'normal' };
    return (
      <div>
        <a href="javascript:void(0)" onClick={toggleDisplayTeam} style={homeStyle}>home </a>
        <a href="javascript:void(0)" onClick={toggleDisplayTeam} style={awayStyle}>away</a>
      </div>
    );
  }

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
        {this.createUndoRedo()}
        {this.createTeamToggle()}
        <div className="game">
          <Lineup />
          {inningFragments}
          <BatterStatistics />
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(fullState: any): StateProps {
  const state = fullState.present as AppState;

  return {
    innings: getPlaysByInning(state),
    gameStatus: getGameStatus(state),
    canUndo: fullState.past.length > 0,
    canRedo: fullState.future.length > 0,
    displayTeam: state.displayTeam,
  };
}

const dispatch = {
  undo: ActionCreators.undo,
  redo: ActionCreators.redo,
  toggleDisplayTeam
};

export default connect(mapStateToProps, dispatch)(Game);
