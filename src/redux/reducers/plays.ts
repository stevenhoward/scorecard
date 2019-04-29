import {ADD_PLAY, ADVANCE_RUNNER, CLEAR_FROM} from '../actionTypes';
import {Play, PlayFragment, IndexedPlayFragment, ActionTypes, AppState} from '../types';

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
    for (const { index: playIndex, fragment } of play.fragments) {
      if (playIndex == index) {
        baseIndex += fragment.bases;
        if (baseIndex >= base) {
          return;
        }
      }
    }

    yield play;
  }
}

function getTotalBases(state: Play[]) : {index: number, bases: number}[] {
  const flatState = state.map((play, index) => play.fragments).flat();

  return groupBy(flatState, x => x.index).
    // ensure batter is not out
    filter(group => group.findIndex(x => x.fragment.bases == 0) == -1).
    // add up total bases
    map(group => {
      return {
        index: group[0].index,
        bases: group.reduce((a, c) => a += c.fragment.bases, 0)
      };
    });
}

export function getBaseRunners(state: Play[]) : Array<number> {
  return getTotalBases(state).filter(ib => ib.bases < 4).
    reduce((acc, cv) => {
      acc[cv.bases - 1] = cv.index;
      return acc;
    }, Array(3));
}

function* getForcedRunners(state: Play[], index: number, numBases: number, label: string) : IterableIterator<IndexedPlayFragment> {
  const bases = getBaseRunners(state);

  for (const base of bases) {
    if (numBases == 0) {
      break;
    }

    if (base === undefined) {
      --numBases;
    }
    else {
      yield { index: base, fragment: { bases: numBases, label } };
    }
  }
}

function* addPlay(state: Play[], indexedFragment: IndexedPlayFragment): IterableIterator<Play> {
  yield* state;

  const { index, fragment } = indexedFragment;
  const label = fragment.label == 'BB' ? 'BB' : `${index}`;

  yield {
    index,
    fragments: [indexedFragment, ...getForcedRunners(state, index, fragment.bases, label)]
  };
}

function* advanceRunner(state: Play[], runnerIndex: number, batterIndex: number, bases: number) {
  for (const play of state) {
    const fragments = play.fragments.map(f => {
      if (f.index == runnerIndex) {
        return {
          index: f.index,
          fragment: {
            bases: bases,
            label: f.fragment.label
          }
        }
      }
      else {
        return f;
      }
    });

    if (play.index == batterIndex) {
      yield {
        index: play.index,
        fragments
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
