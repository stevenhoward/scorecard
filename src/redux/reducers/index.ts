import {ADD_PLAY, CLEAR_FROM} from '../actionTypes';
import {IndexedPlayFragment, ActionTypes} from '../types';

const initialState: IndexedPlayFragment[] = [];

function clearFragmentsFrom(state: IndexedPlayFragment[], index: number, base: number) {
  const result = [];
  let baseIndex = 0;

  for (const i of state) {
    if (i.index == index && (baseIndex += i.fragment.bases) >= base) {
      break;
    }

    result.push(i);
  }

  return result;
}

export function rootReducer(state=initialState, action: ActionTypes) {
  switch(action.type) {
    case ADD_PLAY:
      return [...state, action.payload];

    case CLEAR_FROM:
      return clearFragmentsFrom(state, action.index, action.base);

    default:
      return state;
  }
}

export type AppState = ReturnType<typeof rootReducer>;
