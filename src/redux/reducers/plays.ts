import {ADD_PLAY, CLEAR_FROM} from '../actionTypes';
import {Play, PlayOutcome, PlayFragment, ActionTypes, AppState} from '../types';

import { getBaseRunnersImpl } from '../selectors';

function* clearFragmentsFrom(state: Play[], index: number, base: number) {
  let baseIndex = 0;

  for (const play of state) {
    for (const { runnerIndex, bases } of play.fragments) {
      if (runnerIndex == index) {
        baseIndex += bases;
        if (baseIndex >= base) {
          return;
        }
      }
    }

    yield play;
  }
}

function computeRbis(state: Play[], fragments: PlayFragment[]) {
  const runners = getBaseRunnersImpl(state);
  let rbis = 0;

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

function* addPlay(state: Play[], outcome: PlayOutcome): IterableIterator<Play> {
  const { runnerIndex, bases, label, hit } = outcome;

  const fragment = { runnerIndex, bases, label, };

  // Index of the last batter to record a play. The _current_ batter will be one
  // greater
  const maxIndex = Math.max(...state.map(play => play.index));

  const isBatter = maxIndex < 0 || runnerIndex > maxIndex;

  if (!isBatter) {
    // If the runner is not the current batter, amend the previous at bat
    yield* state.slice(0, -1);

    const lastPlay = state[state.length - 1];
    const fragments = [...lastPlay.fragments, fragment];
    const rbis = computeRbis(state, fragments);

    yield {
      ...lastPlay,
      fragments,
      rbis,
    };
  }
  else {
    yield* state;

    const advancedRunnerLabel = label == 'BB' ? 'BB' : `#${runnerIndex}`;

    let forcedRunners: PlayFragment[] = [];
    if (outcome.handleRunners !== undefined) {
      const runners = getBaseRunnersImpl(state);
      forcedRunners = outcome.handleRunners(runners, runnerIndex);
    }

    const fragments = [ fragment, ...forcedRunners ].sort((a, b) => a.runnerIndex - b.runnerIndex);

    const rbis = computeRbis(state, fragments);

    yield { index: runnerIndex, fragments, rbis, hit: !!hit, };
  }
}

const initialState: Play[] = [];

export function playReducer(state = initialState, action: ActionTypes): Play[] {
  switch(action.type) {
    case ADD_PLAY:
      return Array.from(addPlay(state, action.payload));

    case CLEAR_FROM:
      return Array.from(clearFragmentsFrom(state, action.index, action.base));

    default:
      return state;
  }
}
