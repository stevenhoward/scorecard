import { createSelector } from 'reselect';
import { AppState, Play, Player, PlayFragment, TeamState } from '../types';
import { getInnings, getTotalBasesByInning, InningSlice } from './inning';
import { getBattingTeam } from './core';

export const getCurrentInning =
  createSelector(getInnings, innings => innings[innings.length - 1]);

function getOutsInInningImpl({ inningFragments } : InningSlice) {
  return inningFragments.filter(f => f.bases === 0).length;
}

export const getOutsInInning
  = createSelector(getCurrentInning, getOutsInInningImpl);

function getTotalOutsImpl(state: AppState) {
  return [...state.away.fragments, ...state.home.fragments].
    filter(f => f.bases === 0).length;
}

export const getTotalOuts =
  createSelector((state: AppState) => state, getTotalOutsImpl);

function ordinal(num: number) {
  if (num == 1) return "1st";
  if (num == 2) return "2nd";
  if (num == 3) return "3rd";
  return `${num}th`;
}

const getSide = createSelector(
  getBattingTeam,
  battingTeam => battingTeam == 'away' ? 'Top' : 'Bottom')

function getGameStatusImpl(side: string, totalOuts: number) {
  const outs = totalOuts % 3;
  const inningNumber = ordinal(Math.floor(totalOuts / 6) + 1);
  const plural = outs == 1 ? '' : 's';

  return `${side} of the ${inningNumber}, ${outs} out${plural}.`;
}

export const getGameStatus =
  createSelector(getSide, getTotalOuts, getGameStatusImpl);


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


