export interface PlayFragment {
  // 0 to indicate an out
  bases: number;

  // Text that either goes on the baseline or in the middle (for outs before a
  // runner reaches base)
  label: string;
}

export interface IndexedPlayFragment {
  // identifies which batter this fragment corresponds to (0 for top of the
  // order in the 1st, and so on).
  index: number;

  fragment: PlayFragment;
}

export interface Play {
  index: number;
  fragments: IndexedPlayFragment[];
}

export interface AppState {
  plays: Play[];
}

export interface AddPlayAction {
  type: 'ADD_PLAY';
  payload: IndexedPlayFragment;
}

export interface ClearFromAction {
  type: 'CLEAR_FROM';
  index: number;
  base: number;
}

export interface AdvanceRunnerAction {
  type: 'ADVANCE_RUNNER';
}

export type ActionTypes = AddPlayAction | AdvanceRunnerAction | ClearFromAction;
