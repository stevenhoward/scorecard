import { PlayOption } from './redux/types';

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

export const OutcomeTypes: PlayOption[] = [
  {
    name: "Single",
    resultText: () => `1B`,
    bases: 1,
    hit: true,
  },
  {
    name: "Double",
    resultText: () => `2B`,
    bases: 2,
    hit: true,
  },
  {
    name: "Triple",
    resultText: () => `3B`,
    bases: 3,
    hit: true,
  },
  {
    name: "Home Run",
    resultText: () => `HR`,
    bases: 4,
    hit: true,
  },
  {
    name: "Base on balls",
    resultText: () => `BB`,
    bases: 1,
  },
  {
    name: "Hit by pitch",
    resultText: () => `HBP`,
    bases: 1,
  },
  {
    name: "Strikeout swinging",
    resultText: () => 'K',
    bases: 0,
    outs: 1,
  },
  {
    name: "Strikeout looking",
    resultText: () => unescape('%uA4D8'),
    bases: 0,
    outs: 1,
  },
  {
    name: "Fielder's Choice",
    fielderInputs: 'many',
    resultText: fielders => `FC\n${assistHelper(fielders)}`,
    bases: 1,
    outs: 1,
    available: anyRunners,
  },
  {
    name: "Sacrifice Bunt",
    fielderInputs: 'many',
    resultText: fielders => `SAC ${assistHelper(fielders)}`,
    bases: 0,
    outs: 1,
    available: anyRunners,
  },
  {
    name: "Sacrifice fly",
    fielderInputs: 'one',
    resultText: fielder => `SF ${fielder}`,
    bases: 0,
    outs: 1,
    available: runners => runners[2] !== undefined,
  },
  {
    name: "Groundout",
    fielderInputs: 'many',
    resultText: fielders => assistHelper(fielders),
    bases: 0,
    outs: 1,
  },
  {
    name: "Flyout",
    fielderInputs: 'one',
    resultText: fielder => `${fielder}`,
    bases: 0,
    outs: 1,
  },
  {
    name: "Lineout",
    fielderInputs: 'one',
    resultText: fielder => `L${fielder}`,
    bases: 0,
    outs: 1,
  },
  {
    name: "Grounded into double play",
    fielderInputs: 'many',
    resultText: fielders => `${assistHelper(fielders)} DP`,
    bases: 0,
    outs: 2,
    available: runners => runners[0] !== undefined,
  },
  {
    name: "Caught Stealing",
    onBase: true,
    resultText: () => `CS`,
    bases: 0,
    outs: 1,
  },
  {
    name: "Pick off",
    onBase: true,
    resultText: () => `PO`,
    bases: 0,
    outs: 1,
  },
  {
    name: "Stolen Base",
    resultText: () => `SB`,
    bases: 1,
    onBase: true,
  },
  {
    name: "Wild Pitch",
    resultText: () => `WP`,
    bases: 1,
    onBase: true,
  },
  {
    name: "Passed Ball",
    resultText: () => `PB`,
    bases: 1,
    onBase: true,
  },
];

