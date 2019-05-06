export interface PlayFragment {
  index: number;

  // 0 to indicate an out
  bases: number;

  // Text that either goes on the baseline or in the middle (for outs before a
  // runner reaches base)
  label: string;
}

export interface Play {
  // Index of this batter
  index: number;

  fragments: PlayFragment[];

  // How many RBIs did the batter get?
  rbis: number;

  // Did the batter get a hit?
  hit: boolean;
}

export interface AppState {
  plays: Play[];
}

export interface AddPlayAction {
  type: 'ADD_PLAY';
  payload: PlayFragment;
}

export interface ClearFromAction {
  type: 'CLEAR_FROM';
  index: number;
  base: number;
}

export interface AdvanceRunnerAction {
  type: 'ADVANCE_RUNNER';
  runnerIndex: number;
  batterIndex: number;
  bases: number;
}

export type ActionTypes = AddPlayAction | AdvanceRunnerAction | ClearFromAction;
