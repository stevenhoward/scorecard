import {ADD_PLAY, CLEAR_FROM} from '../actionTypes';
import {Play, PlayOutcome, PlayFragment, ActionTypes, AppState} from '../types';

import { getBaseRunners, getTotalBasesByInning } from '../selectors';

// Given a fragment index, removes everything that happened "after" this point.
function clearFragmentsFrom(state: AppState, fragmentIndex: number): AppState {
  let baseIndex = 0;

  // We want to delete in chronological order, but if this is a runner that
  // might have been forced, we could wind up with the game in an invalid state
  // (e.g. "2 runners on first"). So make sure we rewind further.
  let revisedIndex = fragmentIndex;
  const [ attachedPlay ] = state.plays.filter(p => p.fragmentIndexes.includes(fragmentIndex));
  if (attachedPlay) {
    revisedIndex = Math.min(...attachedPlay.fragmentIndexes);
  }

  const fragments = state.fragments.slice(0, revisedIndex);
  const plays = state.plays.map(play => ({
    ...play,
    fragmentIndexes: play.fragmentIndexes.filter(i => i < fragments.length),
  })).filter(play => play.fragmentIndexes.length > 0);

  return {
    ...state,
    plays,
    fragments
  };
}

function computeRbis(state: AppState, newFragments: PlayFragment[]) {
  const basesByInning = getTotalBasesByInning(state);
  const basesThisInning = basesByInning[basesByInning.length - 1];

  const runners = getBaseRunners(state);
  let rbis = 0;

  if (newFragments.filter(f => f.bases === 0).length > 1) {
    // special case: no RBI for a double play
    // TODO: errors, what have you
    return 0;
  }

  for (const { runnerIndex, bases } of newFragments) {
    const existingBases = basesThisInning.get(runnerIndex) || 0;
    if (existingBases < 4 && existingBases + bases >= 4) {
      ++rbis;
    }
  }

  return rbis;
}

function addBatterPlay(state: AppState, outcome: PlayOutcome, fragment: PlayFragment) {
  let plays = [...state.plays], fragments = [...state.fragments];

  const { handleRunners, hit, label, runnerIndex } = outcome;
  const advancedRunnerLabel = label == 'BB' ? 'BB' : `#${runnerIndex}`;

  let newFragments = [ fragment ];

  if (handleRunners !== undefined) {
    const runners = getBaseRunners(state);
    newFragments = [...newFragments, ...handleRunners(runners, runnerIndex)];
    let { fragmentIndex } = fragment;
    newFragments = newFragments.map(fragment => ({ ...fragment, fragmentIndex: fragmentIndex++ }));

    newFragments.sort((a, b) => b.runnerIndex - a.runnerIndex);
  }

  fragments = [...fragments, ...newFragments];
  const rbis = computeRbis(state, newFragments);

  const fragmentIndexes = fragments.map((_, i) => i).slice(-newFragments.length);

  plays.push({ index: runnerIndex, fragmentIndexes, rbis, hit: !!hit, atBat: !outcome.noAtBat });

  return { ...state, plays, fragments };
}

function addRunnerPlay(state: AppState, outcome: PlayOutcome, fragment: PlayFragment) : AppState {
  let plays = [...state.plays], fragments = [...state.fragments];

  // If the runner is not the current batter, amend the previous at bat
  const newFragmentIndex = fragments.length;
  fragments.push(fragment);

  const lastPlay = plays[plays.length - 1];
  const fragmentIndexes = [...lastPlay.fragmentIndexes, newFragmentIndex].sort();
  const rbis = computeRbis(state, fragments);

  const play = { ...lastPlay, fragmentIndexes, rbis };

  plays = [...plays.slice(0, -1), play];

  return { ...state, plays, fragments };
}

function addPlay(state: AppState, outcome: PlayOutcome) : AppState {
  const { plays, fragments } = state;
  const { runnerIndex, bases, label, hit } = outcome;

  const fragment = { runnerIndex, bases, label, fragmentIndex: fragments.length };

  // Index of the last batter to record a play. The _current_ batter will be one
  // greater
  const maxIndex = Math.max(...plays.map(play => play.index));

  const isBatter = maxIndex < 0 || runnerIndex == maxIndex + 1;
  if (!isBatter) {
    return addRunnerPlay(state, outcome, fragment);
  }
  else {
    return addBatterPlay(state, outcome, fragment);
  }
}

const initialState: AppState = {
  plays: [],
  fragments: [],
  players: [],
};

export function playReducer(state = initialState, action: ActionTypes): AppState {
  switch(action.type) {
    case ADD_PLAY:
      return addPlay(state, action.payload);

    case CLEAR_FROM:
      return clearFragmentsFrom(state, action.fragmentIndex);

    default:
      return state;
  }
}
