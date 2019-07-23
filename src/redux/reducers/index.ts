// @ts-ignore
import undoable from 'redux-undo';
import { ADD_PLAY, SET_DISPLAY_TEAM } from '../actionTypes';
import { AppState, ActionTypes, TeamState, SetDisplayTeamAction } from '../types';
import { playReducer } from './plays';
import { playerReducer } from './players';
import { getDisplayTeam, getInnings } from '../selectors';

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
  displayTeam: 'away',
};

function rootReducer(state = initialState, action: ActionTypes): AppState {
  const existingInnings = getInnings(state).length;

  let newState = playReducer(state, action);
  newState = playerReducer(newState, action);

  const endedInning = action.type == ADD_PLAY &&
    getInnings(newState).length == existingInnings + 1;

  if (endedInning) {
    const displayTeam = newState.displayTeam == 'away' ? 'home' : 'away';
    newState = { ...newState, displayTeam };
  }

  if (action.type == SET_DISPLAY_TEAM) {
    const { team } = action as SetDisplayTeamAction;
    newState = { ...newState, displayTeam: team };
  }

  return newState;
}

export default undoable(rootReducer);
