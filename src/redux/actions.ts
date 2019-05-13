import { ADD_PLAY } from './actionTypes';
import { AddPlayAction, AdvanceRunnerAction, ClearFromAction, PlayOutcome } from './types';

export function addPlay(outcome: PlayOutcome): AddPlayAction {
  return {
    type: 'ADD_PLAY',
    payload: outcome
  };
}

export function clearFrom(index: number, base: number): ClearFromAction {
  return {
    type: 'CLEAR_FROM',
    index,
    base
  };
}
