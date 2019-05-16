import {ADD_PLAY, CLEAR_FROM} from '../actionTypes';
import {Play, PlayOutcome, PlayFragment, ActionTypes, AppState} from '../types';

import { getBaseRunnersImpl } from '../selectors';

function* clearFragmentsFrom(state: Play[], index: number, base: number) {
  let baseIndex = 0;

  for (const play of state) {
    /*
    for (const { runnerIndex, bases } of play.fragments) {
      if (runnerIndex == index) {
        baseIndex += bases;
        if (baseIndex >= base) {
          return;
        }
      }
    }
     */

    yield play;
  }
}

function computeRbis(state: Play[], fragments: PlayFragment[]) {
  const runners = getBaseRunnersImpl(fragments);
  let rbis = 0;

  if (fragments.filter(f => f.bases === 0).length > 1) {
    // special case: no RBI for a double play
    return 0;
  }

  if (fragments[0].bases === 4) {
    // A home run is the only case where a batter bats himself in
    ++rbis;
  }

  for (let i = 0; i < 3; ++i) {
    if (runners[i] != undefined) {
      const advance = fragments.find(f => f.runnerIndex === runners[i]);
      if (advance && i + 1 + advance.bases >= 4) {
        ++rbis;
      }
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
    const runners = getBaseRunnersImpl(fragments);
    newFragments = [...newFragments, ...handleRunners(runners, runnerIndex)];
  }

  fragments = [...fragments, ...newFragments];
  const rbis = computeRbis(plays, fragments);

  const fragmentIndexes = fragments.map((_, i) => i).slice(-newFragments.length);

  plays.push({ index: runnerIndex, fragmentIndexes, rbis, hit: !!hit, });

  return { plays, fragments };
}

function addRunnerPlay(state: AppState, outcome: PlayOutcome, fragment: PlayFragment) : AppState {
  let plays = [...state.plays], fragments = [...state.fragments];

  // If the runner is not the current batter, amend the previous at bat
  const newFragmentIndex = fragments.length;
  fragments.push(fragment);

  const lastPlay = plays[plays.length - 1];
  const fragmentIndexes = [...lastPlay.fragmentIndexes, newFragmentIndex].sort();
  const rbis = computeRbis(plays, fragments);

  const play = { ...lastPlay, fragmentIndexes, rbis };

  plays = [...plays.slice(0, -1), play];

  return { plays, fragments };
}

function addPlay(state: AppState, outcome: PlayOutcome) : AppState {
  const { plays, fragments } = state;
  const { runnerIndex, bases, label, hit } = outcome;

  const fragment = { runnerIndex, bases, label };

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
};

export function playReducer(state = initialState, action: ActionTypes): AppState {
  switch(action.type) {
    case ADD_PLAY:
      return addPlay(state, action.payload);

      //case CLEAR_FROM:
      //return clearFragmentsFrom(state.plays, action.index, action.base);

    default:
      return state;
  }
}
