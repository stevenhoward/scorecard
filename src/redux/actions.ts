import { ADD_PLAY } from './actionTypes';
import { AddPlayAction, AdvanceRunnerAction, ClearFromAction, PlayFragment } from './types';

export function addPlay(fragment: PlayFragment): AddPlayAction {
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

export function advanceRunner(runnerIndex: number, batterIndex: number, bases: number): AdvanceRunnerAction {
  return {
    type: 'ADVANCE_RUNNER',
    runnerIndex,
    batterIndex,
    bases
  };
}
