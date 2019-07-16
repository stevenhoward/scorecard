import { createSelector } from 'reselect';

import { AppState, TeamState } from '../types';

// Very important selector! Other selectors chain off of this one, so only a
// couple places in the code care about which team is home and which is away.
export const getDisplayTeam = (state: AppState) =>
  state.displayTeam == 'home' ? state.home : state.away;

export const getPlays =
  createSelector(getDisplayTeam, team => team.plays);

export const getPlayers =
  createSelector(getDisplayTeam, team => team.players);

export const getFragments =
  createSelector(getDisplayTeam, team => team.fragments);

function getBattingTeamImpl(home: TeamState, away: TeamState) {
  const homeOuts = home.fragments.filter(f => f.bases == 0).length;
  const awayOuts = away.fragments.filter(f => f.bases == 0).length;

  // awayOuts divisible by 3: away team has just started or ended batting
  // awayOuts == homeOuts at the end of an inning
  const key = awayOuts > homeOuts && awayOuts % 3 == 0 ? 'home' : 'away';
  return key;
}

export const getBattingTeam =
  createSelector(
    (state: AppState) => state.home,
    (state: AppState) => state.away,
    getBattingTeamImpl);
