import { createSelector } from 'reselect';
import { getBaseRunners } from './reducers/plays';
import { Play, AppState } from './types';

export const runnersSelector = createSelector(
  (state: AppState) => state.plays,
  (plays: Play[]) => getBaseRunners(plays),
);

export const getCurrentInning = createSelector(
  (state: AppState) => state.plays,
  (plays: Play[]) => plays,
);
