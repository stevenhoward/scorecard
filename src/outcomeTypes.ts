import { PlayOption } from './redux/types';

function assistHelper(fielders: string) {
  if (fielders.length == 1) {
    return `${fielders[0]}U`;
  }
  else {
    return fielders;
  }
}

// convenient filters for plays
const anyRunners = (runners: number[]) =>
  runners.find(b => b !== undefined) != undefined;

const isBatter = (runners: number[], outs: number, isBatter: boolean) => isBatter;

const isNotBatter = (runners: number[], outs: number, isBatter: boolean) => !isBatter;

export const OutcomeTypes: PlayOption[] = [
  {
    name: "Single",
    resultText: () => `1B`,
    bases: 1,
    hit: true,
    available: isBatter,
  },
  {
    name: "Double",
    resultText: () => `2B`,
    bases: 2,
    hit: true,
    available: isBatter,
  },
  {
    name: "Triple",
    resultText: () => `3B`,
    bases: 3,
    hit: true,
    available: isBatter,
  },
  {
    name: "Home Run",
    resultText: () => `HR`,
    bases: 4,
    hit: true,
    available: isBatter,
  },
  {
    name: "Walk",
    resultText: () => `BB`,
    bases: 1,

    // This _can_ happen when someone is on base, but only if the runner is
    // forced and the batter draws a walk.
    available: isBatter,
  },
  {
    name: "Hit by pitch",
    resultText: () => `HBP`,
    bases: 1,
    available: isBatter,
  },
  {
    name: "Strikeout swinging",
    resultText: () => 'K',
    bases: 0,
    outs: 1,
    available: isBatter,
  },
  {
    name: "Strikeout looking",
    resultText: () => unescape('%uA4D8'),
    bases: 0,
    outs: 1,
    available: isBatter,
  },
  {
    name: "Fielder's Choice",
    fielderInputs: 'many',
    resultText: fielders => `FC\n${assistHelper(fielders)}`,
    bases: 1,
    outs: 1,
    available: [isBatter, anyRunners],
  },
  {
    name: "Sacrifice Bunt",
    fielderInputs: 'many',
    resultText: fielders => `SAC ${assistHelper(fielders)}`,
    bases: 0,
    outs: 1,
    available: [isBatter, anyRunners],
  },
  {
    name: "Sacrifice fly",
    fielderInputs: 'one',
    resultText: fielder => `SF ${fielder}`,
    bases: 0,
    outs: 1,
    available: [isBatter, runners => runners[2] !== undefined],
  },
  {
    name: "Groundout",
    fielderInputs: 'many',
    resultText: fielders => assistHelper(fielders),
    bases: 0,
    outs: 1,
    available: isBatter,
  },
  {
    name: "Flyout",
    fielderInputs: 'one',
    resultText: fielder => `${fielder}`,
    bases: 0,
    outs: 1,
    available: isBatter,
  },
  {
    name: "Lineout",
    fielderInputs: 'one',
    resultText: fielder => `L${fielder}`,
    bases: 0,
    outs: 1,
    available: isBatter,
  },
  {
    name: "Grounded into double play",
    fielderInputs: 'many',
    resultText: fielders => `${assistHelper(fielders)} DP`,
    bases: 0,
    outs: 2,
    available: [isBatter, runners => runners[0] !== undefined],
  },
  {
    name: "Caught Stealing",
    onBase: true,
    resultText: () => `CS`,
    bases: 0,
    outs: 1,
    available: isNotBatter,
  },
  {
    name: "Pick off",
    onBase: true,
    resultText: () => `PO`,
    bases: 0,
    outs: 1,
    available: isNotBatter,
  },
  {
    name: "Stolen Base",
    resultText: () => `SB`,
    bases: 1,
    onBase: true,
    available: isNotBatter,
  },
  {
    name: "Wild Pitch",
    resultText: () => `WP`,
    bases: 1,
    onBase: true,
    available: isNotBatter,
  },
  {
    name: "Passed Ball",
    resultText: () => `PB`,
    bases: 1,
    onBase: true,
    available: isNotBatter,
  },
];

