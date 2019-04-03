import {ADD_PLAY, CLEAR_FROM} from '../actionTypes';
import {IndexedPlayFragment, ActionTypes} from '../types';

type RootType = IndexedPlayFragment[];
const initialState: RootType = [];

function* clearFragmentsFrom(state: RootType, index: number, base: number) {
  let baseIndex = 0;

  for (const i of state) {
    if (i.index == index && (baseIndex += i.fragment.bases) >= base) {
      break;
    }

    yield i;
  }
}

// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-a-array-of-objects
function groupBy<T>(xs: T[], key: string): Array<Array<T>>  {
  return Object.values(xs.reduce(function(rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {}));
};

function getTotalBases(state: RootType) : {index: number, bases: number}[] {
  return groupBy(state, 'index').
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

function getBaseRunners(state: RootType) : {index: number, base: number}[] {
  return getTotalBases(state).filter(ib => ib.bases < 4).
    // renaming "bases" to "base" feels a little silly, but more readable
    map(ib => ({index: ib.index, base: ib.bases} as any)).
    sort((a, b) => a.base - b.base);
}

function* getForcedRunners(state: RootType, index: number, numBases: number) {
  const runners = getBaseRunners(state);
  let base = 1;
  for (const runner of runners) {
    while (base < runner.base) {
      ++base;
      --numBases;
    }

    if (numBases > 0 && runner.index < index) {
      yield runner;
    }
  }
}

function* addPlay(state: RootType, indexedFragment: IndexedPlayFragment) {
  yield indexedFragment;

  const { index, fragment } = indexedFragment;

  if (fragment.bases > 0) {
    const label = fragment.label == 'BB' ? fragment.label : '' + index;
    for (const runner of getForcedRunners(state, index, fragment.bases)) {
      yield {
        index: runner.index,
        fragment: {
          label: label,
          bases: fragment.bases,
        }
      };
    }
  }
}

export function rootReducer(state=initialState, action: ActionTypes) {
  switch(action.type) {
    case ADD_PLAY:
      return state.concat(Array.from(addPlay(state, action.payload)));

    case CLEAR_FROM:
      return Array.from(clearFragmentsFrom(state, action.index, action.base));

    default:
      return state;
  }
}

export type AppState = ReturnType<typeof rootReducer>;
