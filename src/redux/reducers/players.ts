import { setForBattingTeam } from './util';
import { AppState, ActionTypes, Player } from '../types';
import { ADD_PLAYER } from '../actionTypes';
import { getDisplayTeam } from '../selectors';

function addPlayer(state: AppState, player: Player): AppState {
  const teamState = getDisplayTeam(state);
  const newTeamState = {
    players: [...teamState.players, player],
  };

  return setForBattingTeam(state, newTeamState);
}

export function playerReducer(state: AppState, action: ActionTypes): AppState {
  switch(action.type) {
    case ADD_PLAYER:
      return addPlayer(state, action.player);

    default:
      return state;
  }
}
