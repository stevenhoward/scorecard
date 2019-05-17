import { ADD_PLAY, ADD_PLAYER, CLEAR_FROM } from './actionTypes';
import { AddPlayAction, AddPlayerAction, ClearFromAction, Player, PlayOutcome } from './types';

export function addPlay(outcome: PlayOutcome): AddPlayAction {
  return {
    type: ADD_PLAY,
    payload: outcome,
  };
}

export function clearFrom(fragmentIndex: number): ClearFromAction {
  return {
    type: CLEAR_FROM,
    fragmentIndex,
  };
}

export function addPlayer(player: Player): AddPlayerAction {
  return {
    type: ADD_PLAYER,
    player,
  };
}
