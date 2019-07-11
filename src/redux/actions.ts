import { ADD_PLAY, ADD_PLAYER } from './actionTypes';
import { AddPlayAction, AddPlayerAction, Player, PlayOutcome } from './types';

export function addPlay(outcome: PlayOutcome): AddPlayAction {
  return {
    type: ADD_PLAY,
    payload: outcome,
  };
}

export function addPlayer(player: Player): AddPlayerAction {
  return {
    type: ADD_PLAYER,
    player,
  };
}
