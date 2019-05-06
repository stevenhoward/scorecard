import {ADD_PLAY, ADVANCE_RUNNER, CLEAR_FROM} from '../actionTypes';
import {Play, PlayFragment, ActionTypes, AppState} from '../types';

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

  for (const runnerIndex of runners) {
    if (numBases == 0) {
      break;
    }

    if (runnerIndex === undefined) {
      --numBases;
    }
    else {
      yield { runnerIndex, bases: numBases, label, };
    }
  }
}

function computeRbis(state: Play[], fragments: PlayFragment[]) {
  const runners = getBaseRunners(state);
  let rbis = 0;

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

function* addPlay(state: Play[], fragment: PlayFragment): IterableIterator<Play> {
  yield* state;

  const { runnerIndex: index, label, bases } = fragment;
  const advancedRunnerLabel = label == 'BB' ? 'BB' : `#${index}`;

  const fragments = [fragment, ...getForcedRunners(state, index, bases, advancedRunnerLabel)];

  const rbis = computeRbis(state, fragments);

  yield { index, fragments, rbis, hit: false };
}

function* advanceRunner(state: Play[], runnerIndex: number, batterIndex: number, bases: number):
 IterableIterator<Play> {
  const runners = getBaseRunners(state);
  let resultsInRbi = false;

  for (let i = 0; i < 3; ++i) {
    if (runners[i] === runnerIndex && i + 1 + bases === 4) {
      resultsInRbi = true;
    }
  }

  for (const play of state) {
    const { index, rbis, fragments, hit } = play;

    if (index == batterIndex) {
      yield {
        index,
        rbis: rbis + (resultsInRbi ? 1 : 0),
        fragments: [
          ...fragments,
          { runnerIndex, bases, label: `#${batterIndex}` },
        ],
        hit: play.hit,
      };
    }
    else {
      yield play;
    }
  }
}

const initialState: Play[] = [];

export function playReducer(state = initialState, action: ActionTypes): Play[] {
  switch(action.type) {
    case ADD_PLAY:
      return Array.from(addPlay(state, action.payload));

    case CLEAR_FROM:
      return Array.from(clearFragmentsFrom(state, action.index, action.base));

    case ADVANCE_RUNNER:
      return Array.from(advanceRunner(state, action.runnerIndex, action.batterIndex, action.bases));

    default:
      return state;
  }
}
