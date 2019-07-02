import { createSelector } from 'reselect';

import { Play, Player, PlayFragment, AppState } from '../types';

export interface InningMeta {
  firstFragment: number;
  lastFragment: number;
  firstPlay: number;
  lastPlay: number;
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

  // If the last fragment was the end of the inning, or this is the start of the
  // game, push an empty inning onto the result
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

export const getPlays = (state: AppState) => state.plays;
export const getPlayers = (state: AppState) => state.players;
export const getFragments = (state: AppState) => state.fragments;

export const getInningMeta =
  createSelector(getPlays, getFragments, getInningMetaImpl);
