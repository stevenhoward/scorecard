import { ADD_PLAY } from './actionTypes';
import { AddPlayAction, ClearFromAction, PlayOutcome } from './types';

export function addPlay(outcome: PlayOutcome): AddPlayAction {
  return {
    type: 'ADD_PLAY',
    payload: outcome,
  };
}

export function clearFrom(fragmentIndex: number): ClearFromAction {
  return {
    type: 'CLEAR_FROM',
    fragmentIndex,
  };
}
