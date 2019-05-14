import { createSelector } from 'reselect';
import { getBaseRunners } from './reducers/plays';
import { Play, PlayFragment, AppState } from './types';

export const getCurrentInningPlays = createSelector(
  (state: AppState) => state.plays,
  (plays: Play[]) => plays,
);

// TODO: fix name and move implementation
export const runnersSelector = createSelector(
  getCurrentInningPlays,
  (plays: Play[]) => getBaseRunners(plays),
);

// Get a flat list of runners reaching, getting out, etc
export const getCurrentInningFragments = createSelector(
  getCurrentInningPlays,
  (plays: Play[]) => plays.flatMap(p => p.fragments),
);

function getOutsInInningImpl(fragments: PlayFragment[]) {
  return fragments.filter(f => f.bases === 0).length;
}

export const getOutsInInning = createSelector(
  getCurrentInningFragments,
  getOutsInInningImpl,
);
