import { AppState, ActionTypes } from '../types';
import { playReducer } from './plays';

const initialState: AppState = {
  plays: [],
};

export default function combinedReducer(state = initialState, action: ActionTypes) {
  return {
    plays: [...playReducer(state.plays, action)],
  }
}
