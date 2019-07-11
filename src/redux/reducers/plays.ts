import { setForActiveTeam } from './util';
import { ADD_PLAY } from '../actionTypes';
import { AppState, Play, PlayOutcome, PlayFragment, ActionTypes } from '../types';

import { getActiveTeam, getBaseRunners, getTotalBasesByInning, getPlays, getFragments } from '../selectors';

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
  let plays = [...getPlays(state)];
  let fragments = [...getFragments(state)];

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

  const teamState = { ...getActiveTeam(state), plays, fragments };
  return setForActiveTeam(state, teamState);
}

function addRunnerPlay(state: AppState, outcome: PlayOutcome, fragment: PlayFragment) : AppState {
  let plays = [...getPlays(state)];
  let fragments = [...getFragments(state)];

  // If the runner is not the current batter, amend the previous at bat
  const newFragmentIndex = fragments.length;
  fragments.push(fragment);

  const lastPlay = plays[plays.length - 1];
  const fragmentIndexes = [...lastPlay.fragmentIndexes, newFragmentIndex].sort();
  const rbis = computeRbis(state, fragments);

  const play = { ...lastPlay, fragmentIndexes, rbis };

  plays = [...plays.slice(0, -1), play];

  const teamState = { ...getActiveTeam(state), plays, fragments };
  return setForActiveTeam(state, teamState);
}

function addPlay(state: AppState, outcome: PlayOutcome) : AppState {
  const plays = getPlays(state);
  const fragments = getFragments(state);

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

export function playReducer(state: AppState, action: ActionTypes): AppState {
  switch(action.type) {
    case ADD_PLAY:
      return addPlay(state, action.payload);

    default:
      return state;
  }
}
