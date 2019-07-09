import { setForActiveTeam } from './util';
import { getActiveTeam } from '../selectors';
import { AppState, ActionTypes, Player } from '../types';
import { ADD_PLAYER } from '../actionTypes';

function addPlayer(state: AppState, player: Player): AppState {
  const teamState = getActiveTeam(state);
  const newTeamState = {
    ...teamState,
    players: [...teamState.players, player],
  };

  return setForActiveTeam(state, newTeamState);
}

export function playerReducer(state: AppState, action: ActionTypes): AppState {
  switch(action.type) {
    case ADD_PLAYER:
      return addPlayer(state, action.player);

    default:
      return state;
  }
}
