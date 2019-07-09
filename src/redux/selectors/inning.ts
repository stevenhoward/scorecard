import { createSelector } from 'reselect';
import { Play, Player, PlayFragment } from '../types';
import { getPlays, getFragments } from './internal';

export interface InningSlice {
  inningFragments: PlayFragment[];
  inningPlays: Play[];
}

function getInningsImpl(plays: Play[], fragments: PlayFragment[]) : InningSlice[] {
  const result: InningSlice[] = [];

  let lastPlay = 0, fragmentIndex = 0;
  let outs = 0;

  for (let inningNumber = 0; fragmentIndex < fragments.length; ++inningNumber) {
    const firstFragment = fragmentIndex, firstPlay = lastPlay;

    // The third out in the inning should always be the last fragment for that
    // inning
    for (outs = 0; outs < 3 && fragmentIndex < fragments.length; ++fragmentIndex) {
      if (fragments[fragmentIndex].bases === 0) {
        ++outs;
      }
    }

    const inningFragments = fragments.slice(firstFragment, fragmentIndex);

    lastPlay = Math.max(...inningFragments.map(f => f.runnerIndex)) + 1;
    const inningPlays = plays.slice(firstPlay, lastPlay);

    result.push({ inningFragments, inningPlays });
  }

  if (outs == 3 || !result.length) {
    const inningFragments = fragments.slice(fragmentIndex);
    const inningPlays = plays.slice(lastPlay);
    result.push({ inningFragments, inningPlays });
  }

  return result;
}

export const getInnings = createSelector(getPlays, getFragments, getInningsImpl);


function getTotalBasesByInningImpl(innings: InningSlice[]) : Map<number, number>[] {
  return innings.map(({ inningFragments }) =>
    inningFragments.reduce(
        (rv, fragment) => {
          const { runnerIndex, bases } = fragment;
          rv.set(runnerIndex, (rv.get(runnerIndex) || 0) + bases);
          return rv;
        },
        new Map<number, number>()));
}

export const getTotalBasesByInning =
  createSelector(getInnings, getTotalBasesByInningImpl);


function getRunsByInningImpl(totalBasesByInning: Map<number, number>[]) {
  return totalBasesByInning.map(basesThisInning =>
    [...basesThisInning.values()].filter(bases => bases == 4).length);
}

export const getRunsByInning =
  createSelector(getTotalBasesByInning, getRunsByInningImpl);


function getPlaysByInningImpl(innings: InningSlice[]) {
  return innings.map(({ inningPlays }) => inningPlays);
}

export const getPlaysByInning =
  createSelector(getInnings, getPlaysByInningImpl);


function getFragmentsByInningImpl(innings: InningSlice[]) {
  return innings.map(({ inningFragments }) => inningFragments);
}

export const getFragmentsByInning =
  createSelector(getInnings, getFragmentsByInningImpl);


function getHitsByInningImpl(innings: InningSlice[]) {
  return innings.map(({ inningPlays }) =>
    inningPlays.filter(play => play.hit).length);
}

export const getHitsByInning =
  createSelector(getInnings, getHitsByInningImpl);
