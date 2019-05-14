import { PlayFragment, PlayOption } from './redux/types';

function assistHelper(fielders: string) {
  if (fielders.length == 1) {
    return `${fielders[0]}U`;
  }
  else {
    return fielders;
  }
}

// convenient filters for plays
const anyRunners = ({ runners } : { runners: number[] }) =>
  runners.find(b => b !== undefined) != undefined;

const isBatter = ({ isBatter }: { isBatter: boolean }) => isBatter;

const isNotBatter = ({ isBatter }: { isBatter: boolean }) => !isBatter;

// "No outs" meaning that nobody is thrown out on the bases.
function forceRunnersNoOutsThunk(bases: number, staticLabel?: string) {
  return function forceRunnersNoOuts(runners: number[], batterIndex: number): PlayFragment[] {
    const result = [];
    const label = staticLabel || `#${batterIndex}`;

    let basesLeft = bases;
    for (let base = 0; base < 3 && basesLeft > 0; ++base) {
      const runnerIndex = runners[base];
      if (runnerIndex !== undefined) {
        result.push({ runnerIndex, label, bases: basesLeft });
      }
      else {
        --basesLeft;
      }
    }

    return result;
  }
}

function fieldersChoice(runners: number[], batterIndex: number): PlayFragment[] {
  const result = [];
  const definedRunners = runners.filter(r => r !== undefined);
  if (definedRunners.length == 1) {
    const [ runnerIndex ] = definedRunners;
    const label = `#${batterIndex}`;
    result.push({ runnerIndex, label, bases: 0 });
  }

  return result;
}

function doublePlay(runners: number[], batterIndex: number): PlayFragment[] {
  const result = [];
  const [ first, second, third ] = runners;
  if (first !== undefined && second == undefined && third == undefined) {
    const runnerIndex = first;
    const label = `#${batterIndex}`;
    result.push({ runnerIndex, label, bases: 0 });
  }

  return result;
}

export const OutcomeTypes: PlayOption[] = [
  {
    name: "Single",
    resultText: () => `1B`,
    bases: 1,
    hit: true,
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(1),
  },
  {
    name: "Double",
    resultText: () => `2B`,
    bases: 2,
    hit: true,
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(2),
  },
  {
    name: "Triple",
    resultText: () => `3B`,
    bases: 3,
    hit: true,
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(3),
  },
  {
    name: "Home Run",
    resultText: () => `HR`,
    bases: 4,
    hit: true,
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(4),
  },
  {
    name: "Walk",
    resultText: () => `BB`,
    bases: 1,

    // This _can_ happen when someone is on base, but only if the runner is
    // forced and the batter draws a walk.
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(1, 'BB'),
  },
  {
    name: "Hit by pitch",
    resultText: () => `HBP`,
    bases: 1,
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(1),
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
    handleRunners: fieldersChoice,
  },
  {
    name: "Sacrifice Bunt",
    fielderInputs: 'many',
    resultText: fielders => `SAC ${assistHelper(fielders)}`,
    bases: 0,
    outs: 1,
    available: [isBatter, anyRunners],
    handleRunners: forceRunnersNoOutsThunk(1),
  },
  {
    name: "Sacrifice fly",
    fielderInputs: 'one',
    resultText: fielder => `SF ${fielder}`,
    bases: 0,
    outs: 1,
    available: [
      isBatter,
      ({ runners }) => runners[2] !== undefined,
      ({ outs }) => outs < 2,
    ],
  },
  {
    name: "Groundout",
    fielderInputs: 'many',
    resultText: fielders => assistHelper(fielders),
    bases: 0,
    outs: 1,
    available: isBatter,
    handleRunners: forceRunnersNoOutsThunk(1),
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
    available: [
      isBatter,
      ({ runners }) => runners[0] !== undefined,
      ({ outs }) => outs < 2,
    ],
    handleRunners: doublePlay,
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

