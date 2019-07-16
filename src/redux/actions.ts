import { ADD_PLAY, ADD_PLAYER, TOGGLE_DISPLAY_TEAM } from './actionTypes';
import { AddPlayAction, AddPlayerAction, ToggleDisplayTeamAction, Player, PlayOutcome } from './types';

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

export function toggleDisplayTeam(): ToggleDisplayTeamAction {
  return { type: TOGGLE_DISPLAY_TEAM };
}
