import { createSelector } from 'reselect';
import { AppState, Play, Player, PlayFragment } from '../types';
import { getInnings, getTotalBasesByInning, InningSlice } from './inning';

export const getCurrentInning =
  createSelector(getInnings, innings => innings[innings.length - 1]);

function getOutsInInningImpl({ inningFragments } : InningSlice) {
  return inningFragments.filter(f => f.bases === 0).length;
}

export const getOutsInInning
  = createSelector(getCurrentInning, getOutsInInningImpl);

function ordinal(num: number) {
  if (num == 1) return "1st";
  if (num == 2) return "2nd";
  if (num == 3) return "3rd";
  return `${num}th`;
}

const getSide = createSelector(
  (state: AppState) => state.activeTeam,
  activeTeam => activeTeam == 'away' ? 'Top' : 'Bottom')

function getGameStatusImpl(innings: InningSlice[], side: string, outs: number) {
  const inningNumber = ordinal(innings.length);
  const plural = outs == 1 ? '' : 's';

  return `${side} of the ${inningNumber}, ${outs} out${plural}.`;
}

export const getGameStatus =
  createSelector(getInnings, getSide, getOutsInInning, getGameStatusImpl);


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


