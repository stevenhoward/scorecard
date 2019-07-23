/***
 * Overview of types:
 *
 * Each team's data is completely independent of the other team.  Each plate
 * appearance is stored within one Play structure, with a 0-based index
 * corresponding to the batting order (a perfect game would have indexes from 0
 * to 26). This is used to identify both the batting statistics associated with
 * the plate appearance and the group of movements (PlayFragment) on the
 * basepaths that happened at that time.
 **/

/***
 * Input types
 **/
interface PlayOutcomeBase {
  // How many bases this player advanced
  bases: number;

  // Number of outs, default zero
  // TODO: this is probably better left as a boolean
  outs?: number;

  // Did the batter get credited with a hit?
  hit?: boolean;

  // Every outcome at the plate is a plate appearance. Some plate appearances
  // are not at bats.
  noAtBat?: boolean;

  // If the present play was generated by the batter, this function receives a
  // 3-tuple of runner indices and returns an array of PlayFragments that move
  // runners, if applicable
  handleRunners?: (runners: number[], batterIndex: number) => PlayFragment[];
}

export interface AvailabilityFilterArgs {
  runners: [ number, number, number ];
  outs: number;
  isBatter: boolean;
}

// Function that takes the above arguments and returns false if the play can't
// be selected in this context
export interface AvailabilityFilter {
  (args: AvailabilityFilterArgs): boolean;
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

// Represents an out or advance for a particular runner from his current
// location
export interface PlayOutcome extends PlayOutcomeBase {
  // Label displayed in the diagram along this particular base path
  // Derived from resultText on PlayOption
  label: string;

  runnerIndex: number;
}

/***
 * Store types
 **/

// Represents something happening on the bases. Several of these can happen in a
// play.
export interface PlayFragment {
  // These correspond directly to the master fragment list, i.e.
  //  state.fragments[i].fragmentIndex === i
  // but sometimes we want to slice the fragment list
  fragmentIndex: number;

  runnerIndex: number;

  // 0 to indicate an out
  bases: number;

  // Text that either goes on the baseline or in the middle (for outs before a
  // runner reaches base)
  label: string;
}

// Represents what happens when the batter gets on base or makes an out.
export interface Play {
  // Index of this batter. runnerIndex is in reference to this index.
  index: number;

  // How many RBIs did the batter get?
  // TODO: this is derived, and should not be part of the source of truth
  // (or is it? Note GiDP, Error exceptions)
  rbis: number;

  // Did the batter get a hit?
  hit: boolean;

  // Is this an at bat?
  atBat: boolean;

  // Indexes refer to AppState.fragments
  fragmentIndexes: number[];
}

export interface Player {
  name: string;
  position: string;
  jerseyNumber?: number;
  slot: number;
  subbedOutIndex?: number;
}

// Data for each team is independent
export interface TeamState {
  plays: Play[];

  fragments: PlayFragment[];

  players: Player[];
}

// Root object for the store
export interface AppState {
  home: TeamState;
  away: TeamState;
  displayTeam: 'home' | 'away';
}

/* Action types */

export interface AddPlayAction {
  type: 'ADD_PLAY';
  payload: PlayOutcome;
}

export interface AddPlayerAction {
  type: 'ADD_PLAYER';
  player: Player;
}

export interface SetDisplayTeamAction {
  type: 'SET_DISPLAY_TEAM';
  team: 'home' | 'away';
}

export type ActionTypes = AddPlayAction | AddPlayerAction | SetDisplayTeamAction;
