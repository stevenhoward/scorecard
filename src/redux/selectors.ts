import { createSelector } from 'reselect';
import { Play, PlayFragment, AppState } from './types';

interface GroupDict<T> {
  [key: string]: T[];
}

interface InningMeta {
  firstFragment: number;
  lastFragment: number;
  firstPlay: number;
  lastPlay: number;
}

interface CurrentInning {
  inningFragments: PlayFragment[];
  inningPlays: Play[];
}

type MaybeNumber = number | undefined;

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

function getPlaysByInningImpl(inningMeta: InningMeta[], plays: Play[]) {
  return inningMeta.reduce(
    (rv, { firstPlay, lastPlay }) =>
      [...rv, plays.slice(firstPlay, lastPlay)],
    [] as Play[][]);
}

function getFragmentsByInningImpl(inningMeta: InningMeta[], fragments: PlayFragment[]) {
  return inningMeta.reduce(
    (rv, { firstFragment, lastFragment }) =>
      [...rv, fragments.slice(firstFragment, lastFragment)] ,
    [] as PlayFragment[][]);
}

function getTotalBasesByInningImpl(inningMeta: InningMeta[], fragments: PlayFragment[]) : Map<number, number>[] {
  return inningMeta.map(({ firstFragment, lastFragment }) =>
    (fragments
      .slice(firstFragment, lastFragment)
      .reduce(
        (rv, fragment) => {
          const { runnerIndex, bases } = fragment;
          rv.set(runnerIndex, (rv.get(runnerIndex) || 0) + bases);
          return rv;
        },
        new Map<number, number>())
    ));
}

// Returns a 3-tuple with the index of the players at [first, second, third]
// base.
// FIXME: exposing this directly because it's used in the reducer code
function getBaseRunnersImpl(totalBases: Map<number, number>[]) : [ number, number, number ] {
  const runnersOn = ([...totalBases[totalBases.length - 1].entries()]
    .map(([ runnerIndex, base ]) => ({ runnerIndex, base }))
    .filter(({ base }) => base > 0 && base < 4)
  );

  return runnersOn.reduce(
    (rv, x) => {
      const { runnerIndex, base } = x;
      rv[base - 1] = runnerIndex;
      return rv;
    },
    new Array(3) as [ number, number, number ]);
}

function getCurrentInningFragmentsImpl(innings: InningMeta[], fragments: PlayFragment[]) {
  const { firstFragment, lastFragment } = innings[innings.length - 1];
  return fragments.slice(firstFragment, lastFragment + 1);
}

function getOutsInInningImpl(fragments: PlayFragment[]) {
  return fragments.filter(f => f.bases === 0).length;
}

function getFragmentsByBatterImpl(fragments: PlayFragment[]) : Map<number, PlayFragment[]> {
  return (fragments
    .reduce(
      (rv, fragment) => {
        const { runnerIndex } = fragment;
        rv.set(runnerIndex, [...(rv.get(runnerIndex) || []), fragment]);
        return rv;
      },
      new Map<number, PlayFragment[]>())
  );
}

function getCurrentInningImpl(inningMeta: InningMeta[], plays: Play[], fragments: PlayFragment[]) : CurrentInning {
  const { firstPlay, lastPlay, firstFragment, lastFragment } = inningMeta[inningMeta.length - 1];

  const inningPlays = plays.slice(firstPlay, lastPlay);
  const inningFragments = fragments.slice(firstFragment, lastFragment);
  return { inningPlays, inningFragments };
}

function getOutsByBatterImpl(fragments: PlayFragment[]) {
  return (fragments
    .filter(({ bases }) => bases === 0)
    .reduce(
      (rv, { runnerIndex }, i) => {
        rv[runnerIndex] = i % 3 + 1;
        return rv;
      },
      {} as any)
  );
}

export const getPlays = (state: AppState) => state.plays;
export const getFragments = (state: AppState) => state.fragments;

export const getInningMeta =
  createSelector(getPlays, getFragments, getInningMetaImpl);

export const getCurrentInning =
  createSelector(getInningMeta, getPlays, getFragments, getCurrentInningImpl);

export const getPlaysByInning =
  createSelector(getInningMeta, getPlays, getPlaysByInningImpl);

export const getFragmentsByInning =
  createSelector(getInningMeta, getFragments, getFragmentsByInningImpl);

export const getCurrentInningFragments =
  createSelector(getInningMeta, getFragments, getCurrentInningFragmentsImpl);

export const getTotalBasesByInning =
  createSelector(getInningMeta, getFragments, getTotalBasesByInningImpl);

export const getBaseRunners =
  createSelector(getTotalBasesByInning, getBaseRunnersImpl);

export const getOutsInInning
  = createSelector(getCurrentInningFragments, getOutsInInningImpl);

export const getFragmentsByBatter
  = createSelector(getFragments, getFragmentsByBatterImpl);

export const getOutsByBatter
  = createSelector(getFragments, getOutsByBatterImpl);
