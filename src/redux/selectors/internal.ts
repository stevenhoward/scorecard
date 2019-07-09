import { createSelector } from 'reselect';

import { AppState } from '../types';

// Very important selector! Other selectors chain off of this one, so only a
// couple places in the code care about which team is home and which is away.
export const getActiveTeam = (state: AppState) =>
  state.activeTeam == 'home' ? state.home : state.away;

export const getPlays =
  createSelector(getActiveTeam, team => team.plays);

export const getPlayers =
  createSelector(getActiveTeam, team => team.players);

export const getFragments =
  createSelector(getActiveTeam, team => team.fragments);
