import { createSelector } from 'reselect';
import { Play, PlayFragment, Player } from '../types';
import { getFragments, getPlays, getPlayers } from './core';

export interface BatterStatsEntry {
  slot: number;
  atBats: number;
  hits: number;
  runs: number;
  rbis: number;
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

export const getFragmentsByBatter
  = createSelector(getFragments, getFragmentsByBatterImpl);


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

export const getOutsByBatter
  = createSelector(getFragments, getOutsByBatterImpl);


function getStatisticsByBatterImpl(plays: Play[], fragments: PlayFragment[], players: Player[]) {
  const result = [];
  for (const player of players) {
    const { slot, subbedOutIndex } = player;

    const playerPlays = plays.filter(
      f => f.index % 9 == slot &&
      (subbedOutIndex === undefined || subbedOutIndex < f.index));

    const playerFragments = fragments.filter(
      f => f.runnerIndex % 9 == slot &&
      (subbedOutIndex === undefined || subbedOutIndex < f.runnerIndex));

    const atBats = playerPlays.filter(play => play.atBat).length;
    const hits = playerPlays.filter(play => play.hit).length;
    const rbis = playerPlays.reduce(
      (rbis, play) => rbis + play.rbis,
      0);

    const runs = ([...playerFragments.reduce(
        (rv, f) => {
          rv.set(f.runnerIndex, (rv.get(f.runnerIndex) || 0) + f.bases);
          return rv;
        },
        new Map<number, number>())
      .entries()]
      .filter(([ index, bases ]) => bases == 4)
    ).length;


    result.push({ slot, atBats, hits, runs, rbis });
  }

  return result;
}

export const getStatisticsByBatter
  = createSelector(getPlays, getFragments, getPlayers, getStatisticsByBatterImpl);
