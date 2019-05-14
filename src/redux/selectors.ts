import { createSelector } from 'reselect';
import { Play, PlayFragment, AppState } from './types';

interface GroupDict<T> {
  [key: string]: T[];
}

function groupBy<T>(xs: T[], keyFunc: (t: T) => number | string): T[][] {
  return Object.values(xs.reduce((rv: GroupDict<T>, x: T) => {
    const key = keyFunc(x);
    rv[key] = [...(rv[key] || []), x];
    return rv;
  }, {}));
}

// Returns an array with the total number of bases for each player who's not
// out.
function getTotalBases(state: Play[]) : {index: number, bases: number}[] {
  const flatState = state.flatMap((play, index) => play.fragments);

  return groupBy(flatState, x => x.runnerIndex).
    // ensure batter is not out
    filter(group => group.findIndex(x => x.bases == 0) == -1).
    // add up total bases
    map(group => {
      return {
        index: group[0].runnerIndex,
        bases: group.reduce((a, c) => a += c.bases, 0)
      };
    });
}

// Returns a 3-tuple with the index of the players at [first, second, third]
// base.
// FIXME: exposing this directly because it's used in the reducer code
export function getBaseRunnersImpl(state: Play[]) : [ number, number, number ] {
  return getTotalBases(state).filter(ib => ib.bases < 4).
    reduce((acc, cv) => {
      acc[cv.bases - 1] = cv.index;
      return acc;
    }, Array(3)) as [number, number, number];
}

export const getCurrentInningPlays = createSelector(
  (state: AppState) => state.plays,
  (plays: Play[]) => plays,
);

export const getBaseRunners = createSelector(
  getCurrentInningPlays,
  (plays: Play[]) => getBaseRunnersImpl(plays),
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
