import { AppState, ActionTypes } from '../types';
import { playReducer } from './plays';

const initialState: AppState = {
  plays: [],
  fragments: [],
};

export default playReducer;
