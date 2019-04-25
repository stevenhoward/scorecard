import {ADD_PLAY, ADVANCE_RUNNER, CLEAR_FROM} from '../actionTypes';
import {Play, PlayFragment, IndexedPlayFragment, ActionTypes, AppState} from '../types';

function* clearFragmentsFrom(state: Play[], index: number, base: number) {
  let baseIndex = 0;

  for (const play of state) {
    for (const { index: playIndex, fragment } of play.fragments) {
      if (playIndex == index && (baseIndex += fragment.bases) >= base) {
        break;
      }
    }

    yield play;
  }
}

function groupBy<T>(xs: T[], keyFunc: (t: T) => number | string): T[][] {
  return Object.values(xs.reduce((rv: any, x: T) => {
    const key = keyFunc(x);
    rv[key] = [...(rv[key] || []), x];
    return rv;
  }, {}));
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

function getBaseRunners(state: Play[]) : {index: number, base: number}[] {
  return getTotalBases(state).filter(ib => ib.bases < 4).
    // renaming "bases" to "base" feels a little silly, but more readable
    map(ib => ({index: ib.index, base: ib.bases} as any)).
    sort((a, b) => a.base - b.base);
}

function* getForcedRunners(state: Play[], index: number, numBases: number) {
  const runners = getBaseRunners(state);
  let base = 1;
  for (const runner of runners) {
    let _bases = numBases;
    while (base < runner.base) {
      ++base;
      --_bases;
    }

    if (_bases > 0 && runner.index < index) {
      yield runner;
    }
  }
}

  /*
function* addPlay(state: Play[], indexedFragment: IndexedPlayFragment) {
  yield* state;
  yield indexedFragment;

  const { index, fragment } = indexedFragment;

  if (fragment.bases > 0) {
    const label = fragment.label == 'BB' ? fragment.label : '' + index;
    for (const runner of [...getForcedRunners(state, index, fragment.bases)].reverse()) {
      yield {
        index: runner.index,
        fragment: {
          label: label,
          bases: fragment.bases,
          plateAppearance: fragment.plateAppearance,
        }
      };
    }
  }
}
   */

function* addPlay(state: Play[], indexedFragment: IndexedPlayFragment): IterableIterator<Play> {
  yield* state;

  const { index, fragment } = indexedFragment;
  const fragments = [indexedFragment];

  const label = fragment.label == 'BB' ? fragment.label : '' + index;

  for (const runner of getForcedRunners(state, index, fragment.bases)) {
    fragments.push({
      index: runner.index,
      fragment: {
        label: label,
        bases: runner.base,
      }
    });
  }

  yield { index: indexedFragment.index, fragments: fragments };
}

const initialState = ([] as Play[]);

export function playReducer(state = initialState, action: ActionTypes): Play[] {
  switch(action.type) {
    case ADD_PLAY:
      return Array.from(addPlay(state, action.payload));

    case CLEAR_FROM:
      return Array.from(clearFragmentsFrom(state, action.index, action.base));

    case ADVANCE_RUNNER:
      return state;

    default:
      return state;
  }
}
