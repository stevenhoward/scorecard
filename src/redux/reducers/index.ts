import { AppState, ActionTypes, TeamState } from '../types';
import { playReducer } from './plays';
import { playerReducer } from './players';
import { getActiveTeam } from '../selectors';

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

export default function rootReducer(state = initialState, action: ActionTypes): AppState {
  let newState = playReducer(state, action);
  newState = playerReducer(newState, action);

  return newState;
}
