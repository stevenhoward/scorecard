export interface PlayFragment {
  // 0 to indicate an out
  bases: number;

  // Text that either goes on the baseline or in the middle (for outs before a
  // runner reaches base)
  label: string;

  rbi?: string;
}

// Play fragment that is associated with a particular plate appearance.
export interface IndexedPlayFragment {
  index: number;
  fragment: PlayFragment;
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

export type ActionTypes = AddPlayAction | ClearFromAction;
