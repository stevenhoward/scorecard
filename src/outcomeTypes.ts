export interface PlayOutcome {
  // Label in the interface
  label: string;

  // Display name for what happened
  //  hit: () => ('1B')
  //  lineout: fielder => `L${fielder}`
  // parameter is empty if fielderInputs is undefined
  resultText: (fielders: string) => string;

  // Default: no fielders needed
  // 'one': e.g. 'L8'
  // 'many': '4-3' or '3U'
  fielderInputs?: 'one' | 'many';

  // How many bases this player advanced
  bases: number;

  // Number of outs, default zero
  outs?: number;

  // Did the batter get credited with a hit?
  hit?: boolean;

  // Is this outcome only possible when already on base?
  onBase?: boolean;

  // Given the runners on base, can this play type happen?
  // Default is always available
  available?: (runners: number[]) => boolean;
}

function assistHelper(fielders: string) {
  if (fielders.length == 1) {
    return `${fielders[0]}U`;
  }
  else {
    return fielders;
  }
}

const anyRunners = (runners: number[]) =>
  runners.find(b => b !== undefined) != undefined;

export const OutcomeTypes: PlayOutcome[] = [
  {
    label: "Single",
    resultText: () => `1B`,
    bases: 1,
    hit: true,
  },
  {
    label: "Double",
    resultText: () => `2B`,
    bases: 2,
    hit: true,
  },
  {
    label: "Triple",
    resultText: () => `3B`,
    bases: 3,
    hit: true,
  },
  {
    label: "Home Run",
    resultText: () => `HR`,
    bases: 4,
    hit: true,
  },
  {
    label: "Base on balls",
    resultText: () => `BB`,
    bases: 1,
  },
  {
    label: "Hit by pitch",
    resultText: () => `HBP`,
    bases: 1,
  },
  {
    label: "Strikeout swinging",
    resultText: () => 'K',
    bases: 0,
    outs: 1,
  },
  {
    label: "Strikeout looking",
    resultText: () => unescape('%uA4D8'),
    bases: 0,
    outs: 1,
  },
  {
    label: "Fielder's Choice",
    fielderInputs: 'many',
    resultText: fielders => `FC ${assistHelper(fielders)}`,
    bases: 1,
    outs: 1,
    available: runners => runners[0] !== undefined,
  },
  {
    label: "Sacrifice Bunt",
    fielderInputs: 'many',
    resultText: fielders => `SAC ${assistHelper(fielders)}`,
    bases: 0,
    outs: 1,
    available: anyRunners,
  },
  {
    label: "Sacrifice fly",
    fielderInputs: 'one',
    resultText: fielder => `SF ${fielder}`,
    bases: 0,
    outs: 1,
    available: runners => runners[2] !== undefined,
  },
  {
    label: "Groundout",
    fielderInputs: 'many',
    resultText: fielders => assistHelper(fielders),
    bases: 0,
    outs: 1,
  },
  {
    label: "Flyout",
    fielderInputs: 'one',
    resultText: fielder => `${fielder}`,
    bases: 0,
    outs: 1,
  },
  {
    label: "Lineout",
    fielderInputs: 'one',
    resultText: fielder => `L${fielder}`,
    bases: 0,
    outs: 1,
  },
  {
    label: "Grounded into double play",
    fielderInputs: 'many',
    resultText: fielders => `${assistHelper(fielders)} DP`,
    bases: 0,
    outs: 2,
    available: runners => runners[0] !== undefined,
  },
  {
    label: "Caught Stealing",
    onBase: true,
    resultText: () => `CS`,
    bases: 0,
    outs: 1,
  },
  {
    label: "Pick off",
    onBase: true,
    resultText: () => `PO`,
    bases: 0,
    outs: 1,
  },
  {
    label: "Stolen Base",
    resultText: () => `SB`,
    bases: 1,
    onBase: true,
  },
  {
    label: "Wild Pitch",
    resultText: () => `WP`,
    bases: 1,
    onBase: true,
  },
  {
    label: "Passed Ball",
    resultText: () => `PB`,
    bases: 1,
    onBase: true,
  },
];

