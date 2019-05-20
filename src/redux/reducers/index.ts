import { AppState, ActionTypes } from '../types';
import { playReducer } from './plays';
import { playerReducer } from './players';

const initialState: AppState = {
  plays: [],
  fragments: [],
  players: Array(9).fill(null).map((_, i) => ({
    name: '',
    position: '',
    slot: i
  })),
};

export default function rootReducer(state = initialState, action: ActionTypes): AppState {
  state = playReducer(state, action);
  return playerReducer(state, action);
}
