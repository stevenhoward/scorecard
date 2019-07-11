// @ts-ignore
import undoable from 'redux-undo';
import { AppState, ActionTypes, TeamState } from '../types';
import { playReducer } from './plays';
import { playerReducer } from './players';
import { getActiveTeam, getInnings } from '../selectors';

function initialTeamState() : TeamState {
  return {
    plays: [],
    fragments: [],
    players: Array(9).fill(null).map((_, i) => ({
      name: '',
      position: '',
      slot: i,
    })),
  };
}

const initialState: AppState = {
  home: initialTeamState(),
  away: initialTeamState(),
  activeTeam: 'away',
};

function rootReducer(state = initialState, action: ActionTypes): AppState {
  const existingInnings = getInnings(state).length;

  let newState = playReducer(state, action);
  newState = playerReducer(newState, action);

  if (getInnings(newState).length == existingInnings + 1) {
    const activeTeam = newState.activeTeam == 'away' ? 'home' : 'away';
    newState = { ...newState, activeTeam };
  }

  return newState;
}

export default undoable(rootReducer);
