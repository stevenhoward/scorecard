import { ADD_PLAY } from './actionTypes';
import { AddPlayAction, ClearFromAction, IndexedPlayFragment } from './types';

export function addPlay(fragment: IndexedPlayFragment): AddPlayAction {
  return {
    type: 'ADD_PLAY',
    payload: fragment
  };
}

export function clearFrom(index: number, base: number): ClearFromAction {
  return {
    type: 'CLEAR_FROM',
    index,
    base
  };
}
