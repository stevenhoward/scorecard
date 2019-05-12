// Represents something happening on the bases. Several of these can happen in a
// play.
export interface PlayFragment {
  runnerIndex: number;

  // 0 to indicate an out
  bases: number;

  // Text that either goes on the baseline or in the middle (for outs before a
  // runner reaches base)
  label: string;
}

// Represents what happens when the batter gets on base or makes an out.
export interface Play {
  // Index of this batter
  index: number;

  // How many RBIs did the batter get?
  // TODO: this is derived, and should not be part of the source of truth
  rbis: number;

  // Did the batter get a hit?
  hit: boolean;

  // Which runners moved on the play?
  fragments: PlayFragment[];
}

// Root object for the store
export interface AppState {
  plays: Play[];
}

/* Action types */

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
