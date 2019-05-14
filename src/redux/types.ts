interface PlayOutcomeBase {
  // How many bases this player advanced
  bases: number;

  // Number of outs, default zero
  // TODO: this is probably better left as a boolean
  outs?: number;

  // Did the batter get credited with a hit?
  hit?: boolean;
}

export interface AvailabilityFilter {
  (runners: number[], outs: number, isBatter: boolean): boolean;
}

// Represents an option that the user might be able to select for a play
export interface PlayOption extends PlayOutcomeBase {
  // Label in the interface
  name: string;

  // Given the runners on base, can this play type happen?
  // Default (undefined) is always available
  //
  // runners: 3-tuple. TODO: use real tuple; account for undefined
  // outs: how many outs are there?
  // isBatter: is this the player currently up at bat?
  available?: AvailabilityFilter | AvailabilityFilter[];

  // true: can only happen to a runner
  // false: can only happen to a batter
  // undefined: no restriction
  onBase?: boolean;

  // Default: no fielders needed
  // 'one': e.g. 'L8'
  // 'many': '4-3' or '3U'
  fielderInputs?: 'one' | 'many';

  // Display name for what happened
  //  hit: () => ('1B')
  //  lineout: fielder => `L${fielder}`
  // parameter is empty if fielderInputs is undefined
  resultText: (fielders: string) => string;
}

// Represents the outcome of a selected option, including any selected fielders
export interface PlayOutcome extends PlayOutcomeBase {
  // Label displayed in the diagram along this particular base path
  // Derived from resultText on PlayOption
  label: string;

  runnerIndex: number;
}

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
  payload: PlayOutcome;
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
