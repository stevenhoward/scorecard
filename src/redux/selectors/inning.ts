import { createSelector } from 'reselect';
import { Play, Player, PlayFragment } from '../types';
import { getInningMeta, getPlays, getFragments, InningMeta } from './internal';

interface CurrentInning {
  inningFragments: PlayFragment[];
  inningPlays: Play[];
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

export const getTotalBasesByInning =
  createSelector(getInningMeta, getFragments, getTotalBasesByInningImpl);

// Returns a 3-tuple with the index of the players at [first, second, third]
// base.
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

export const getBaseRunners =
  createSelector(getTotalBasesByInning, getBaseRunnersImpl);


function getCurrentInningImpl(inningMeta: InningMeta[], plays: Play[], fragments: PlayFragment[]) : CurrentInning {
  const { firstPlay, lastPlay, firstFragment, lastFragment } = inningMeta[inningMeta.length - 1];

  const inningPlays = plays.slice(firstPlay, lastPlay);
  const inningFragments = fragments.slice(firstFragment, lastFragment);
  return { inningPlays, inningFragments };
}

export const getCurrentInning =
  createSelector(getInningMeta, getPlays, getFragments, getCurrentInningImpl);


function getCurrentInningFragmentsImpl({ inningFragments } : CurrentInning) {
  return inningFragments;
}

export const getCurrentInningFragments =
  createSelector(getCurrentInning, getCurrentInningFragmentsImpl);


function getOutsInInningImpl(fragments: PlayFragment[]) {
  return fragments.filter(f => f.bases === 0).length;
}

export const getOutsInInning
  = createSelector(getCurrentInningFragments, getOutsInInningImpl);


function getRunsByInningImpl(totalBasesByInning: Map<number, number>[]) {
  return totalBasesByInning.map(basesThisInning =>
    [...basesThisInning.values()].filter(bases => bases == 4).length);
}

export const getRunsByInning =
  createSelector(getTotalBasesByInning, getRunsByInningImpl);


function getPlaysByInningImpl(inningMeta: InningMeta[], plays: Play[]) {
  return inningMeta.reduce(
    (rv, { firstPlay, lastPlay }) =>
      [...rv, plays.slice(firstPlay, lastPlay)],
    [] as Play[][]);
}

export const getPlaysByInning =
  createSelector(getInningMeta, getPlays, getPlaysByInningImpl);


function getHitsByInningImpl(playsByInning: Play[][]) {
  return playsByInning.map(playsThisInning =>
    playsThisInning.filter(play => play.hit).length);
}

export const getHitsByInning =
  createSelector(getPlaysByInning, getHitsByInningImpl);


function getFragmentsByInningImpl(inningMeta: InningMeta[], fragments: PlayFragment[]) {
  return inningMeta.reduce(
    (rv, { firstFragment, lastFragment }) =>
      [...rv, fragments.slice(firstFragment, lastFragment)] ,
    [] as PlayFragment[][]);
}

export const getFragmentsByInning =
  createSelector(getInningMeta, getFragments, getFragmentsByInningImpl);