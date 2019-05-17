import { AppState, ActionTypes } from '../types';
import { playReducer } from './plays';
import { playerReducer } from './players';

const initialState: AppState = {
  plays: [],
  fragments: [],
  players: [],
};

export default function rootReducer(state = initialState, action: ActionTypes): AppState {
  state = playReducer(state, action);
  return playerReducer(state, action);
}
