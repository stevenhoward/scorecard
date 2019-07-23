import { ADD_PLAY, ADD_PLAYER, SET_DISPLAY_TEAM } from './actionTypes';
import { AddPlayAction, AddPlayerAction, SetDisplayTeamAction, Player, PlayOutcome } from './types';

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

export function setDisplayTeam(team: 'home' | 'away'): SetDisplayTeamAction {
  return {
    type: SET_DISPLAY_TEAM,
    team,
  };
}
