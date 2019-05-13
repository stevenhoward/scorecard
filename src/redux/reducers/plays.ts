import {ADD_PLAY, CLEAR_FROM} from '../actionTypes';
import {Play, PlayOutcome, PlayFragment, ActionTypes, AppState} from '../types';

interface GroupDict<T> {
  [key: string]: T[];
}

function groupBy<T>(xs: T[], keyFunc: (t: T) => number | string): T[][] {
  return Object.values(xs.reduce((rv: GroupDict<T>, x: T) => {
    const key = keyFunc(x);
    rv[key] = [...(rv[key] || []), x];
    return rv;
  }, {}));
}

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

// Returns an array with the total number of bases for each player who's not
// out.
function getTotalBases(state: Play[]) : {index: number, bases: number}[] {
  const flatState = state.flatMap((play, index) => play.fragments);

  return groupBy(flatState, x => x.runnerIndex).
    // ensure batter is not out
    filter(group => group.findIndex(x => x.bases == 0) == -1).
    // add up total bases
    map(group => {
      return {
        index: group[0].runnerIndex,
        bases: group.reduce((a, c) => a += c.bases, 0)
      };
    });
}

// Returns a 3-tuple with the index of the players at [first, second, third]
// base.
export function getBaseRunners(state: Play[]) : Array<number> {
  return getTotalBases(state).filter(ib => ib.bases < 4).
    reduce((acc, cv) => {
      acc[cv.bases - 1] = cv.index;
      return acc;
    }, Array(3));
}

function* getForcedRunners(state: Play[], index: number, numBases: number, label: string) : IterableIterator<PlayFragment> {
  const runners = getBaseRunners(state);

  let startBase = 1;
  for (const runnerIndex of runners) {
    if (numBases == 0) {
      break;
    }

    if (runnerIndex === undefined) {
      --numBases;
    }
    else {
      const bases = Math.min(4 - startBase, numBases);
      yield { runnerIndex, bases, label, };
    }

    ++startBase;
  }
}

function computeRbis(state: Play[], fragments: PlayFragment[]) {
  const runners = getBaseRunners(state);
  let rbis = 0;

  if (fragments[0].label == "HR") {
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

  if (maxIndex >= 0 && runnerIndex <= maxIndex) {
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

    const fragments = [
      fragment,
      ...getForcedRunners(state, runnerIndex, bases, advancedRunnerLabel)
    ];

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
