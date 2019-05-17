import { AppState, ActionTypes, Player } from '../types';
import { ADD_PLAYER } from '../actionTypes';

const initialState: AppState = {
  plays: [],
  fragments: [],
  players: [],
};

function addPlayer(state: AppState, player: Player): AppState {
  return {
    ...state,
    players: [...state.players, player],
  };
}

export function playerReducer(state = initialState, action: ActionTypes): AppState {
  switch(action.type) {
    case ADD_PLAYER:
      return addPlayer(state, action.player);

    default:
      return state;
  }
}
