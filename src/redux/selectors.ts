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
function getTotalBases(fragmentsThisInning: PlayFragment[]) : {index: number, bases: number}[] {
  return groupBy(fragmentsThisInning, x => x.runnerIndex).
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
export function getBaseRunnersImpl(fragmentsThisInning: PlayFragment[]) : [ number, number, number ] {
  return getTotalBases(fragmentsThisInning).filter(ib => ib.bases < 4).
    reduce((acc, cv) => {
      acc[cv.bases - 1] = cv.index;
      return acc;
    }, Array(3)) as [number, number, number];
}

interface InningMeta {
  firstFragment: number;
  lastFragment: number;
  firstPlay: number;
  lastPlay: number;
}

function getInningMetaImpl(plays: Play[], fragments: PlayFragment[]) : InningMeta[] {
  const innings: InningMeta[] = [];

  let playIndex = 0, fragmentIndex = 0;
  let outs = 0;

  for (let inningNumber = 0; fragmentIndex < fragments.length; ++inningNumber) {
    const firstFragment = fragmentIndex, firstPlay = playIndex;

    for (outs = 0; outs < 3 && fragmentIndex < fragments.length; ++fragmentIndex) {
      if (fragments[fragmentIndex].bases === 0) {
        ++outs;
      }
    }

    const lastFragment = fragmentIndex;
    playIndex = Math.max(
      ...fragments.slice(firstFragment, lastFragment).map(f => f.runnerIndex)
    ) + 1;

    innings.push({ firstFragment, lastFragment, firstPlay, lastPlay: playIndex });
  }

  // If there are no outs,
  if (outs === 3 || !innings.length) {
    innings.push({
      firstFragment: fragmentIndex,
      lastFragment: fragmentIndex,
      firstPlay: playIndex,
      lastPlay: playIndex,
    });
  }

  return innings;
}

export const getInningMeta = createSelector(
  (state: AppState) => state.plays,
  (state: AppState) => state.fragments,
  getInningMetaImpl,
);

function getPlaysByInningImpl(inningMeta: InningMeta[], plays: Play[], fragments: PlayFragment[]) : Play[][] {
  const innings: Play[][] = [];

  for (const { firstPlay, lastPlay } of inningMeta) {
    innings.push(plays.slice(firstPlay, lastPlay));
  }

  return innings;
}

export const getPlaysByInning = createSelector(
  getInningMeta,
  (state: AppState) => state.plays,
  (state: AppState) => state.fragments,
  getPlaysByInningImpl,
);

export const getCurrentInningPlays = createSelector(
  getPlaysByInning,
  (plays: Play[][]) => plays[plays.length - 1],
);

function getCurrentInningFragmentsImpl(innings: InningMeta[], fragments: PlayFragment[]) {
  const { firstFragment, lastFragment } = innings[innings.length - 1];
  return fragments.slice(firstFragment, lastFragment + 1);
}

export const getCurrentInningFragments = createSelector(
  getInningMeta,
  (state: AppState) => state.fragments,
  getCurrentInningFragmentsImpl,
);

export const getBaseRunners = createSelector(
  getCurrentInningFragments,
  (fragments: PlayFragment[]) => getBaseRunnersImpl(fragments),
);

function getOutsInInningImpl(fragments: PlayFragment[]) {
  return fragments.filter(f => f.bases === 0).length;
}

export const getOutsInInning = createSelector(
  getCurrentInningFragments,
  getOutsInInningImpl,
);

function getFragmentIndexesByBatterImpl(fragments: PlayFragment[]) {
  return fragments.map((fragment, index) => ({fragment, index})).reduce(
    (rv, { fragment, index }) => {
      rv.set(fragment.runnerIndex, [...(rv.get(fragment.runnerIndex) || []), index]);
      return rv;
    },
    new Map<number, number[]>()
  );
}

export const getFragmentIndexesByBatter = createSelector(
  (state: AppState) => state.fragments,
  getFragmentIndexesByBatterImpl,
);
