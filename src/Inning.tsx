import React, { Component } from 'react';
import PlateAppearance from './PlateAppearance';
import {PlayFragment} from './Play';

interface InningProps {
  battingOrder: any[];

  // e.g. 0 in the first inning
}

interface InningState {
  indexedFragments: { fragment: PlayFragment, index: number }[];
}

// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-a-array-of-objects
function groupBy<T>(xs: T[], key: string): Array<Array<T>>  {
  return Object.values(xs.reduce(function(rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {}));
};

export default class Inning extends Component<InningProps, InningState> {
  constructor(props: InningProps) {
    super(props);
    this.state = {
      indexedFragments: [],
    };
  }

  private getTotalBases() : {index: number, bases: number}[] {
    return groupBy(this.state.indexedFragments, 'index').
      // ensure batter is not out
      filter(group => group.findIndex(x => x.fragment.bases == 0) == -1).
      // add up total bases
      map(group => {
        return {
          index: group[0].index,
          bases: group.reduce((a, c) => a += c.fragment.bases, 0)
        };
      });
  }

  private getBaseRunners() : {index: number, base: number}[] {
    return this.getTotalBases().filter(ib => ib.bases < 4).
      // renaming "bases" to "base" feels a little silly, but more readable
      map(ib => ({index: ib.index, base: ib.bases} as any)).
      sort((a, b) => a.base - b.base);
  }

  private* getForcedRunners() {
    const runners = this.getBaseRunners();
    let previousBase = 0;
    for (const runner of runners) {
      if (runner.base == previousBase + 1) {
        yield runner;
        ++previousBase;
      }
    }
  }

  // User clicked an empty segment and we need to add it
  private handlePlayFragment(index: number, fragment: PlayFragment) {
    const name = this.props.battingOrder[index % this.props.battingOrder.length];
    const forcedRunners = Array.from(this.getForcedRunners()).map(runner => {
      return {
        index: runner.index,
        fragment: {
          label: name,
          bases: fragment.bases,
        }
      };
    });

    const fragments = this.state.indexedFragments.
      concat({ index: index, fragment: fragment}).
      concat(forcedRunners);

    this.setState({
      indexedFragments: fragments
    });
  }

  // The user clicked a filled in segment and we need to remove it from the data
  private handleClearFragment(index: number, base: number) {
    const result = [];
    let baseIndex = 0;

    for (const i of this.state.indexedFragments) {
      if (i.index != index) {
        result.push(i);
      }
      else if ((baseIndex += i.fragment.bases) < base) {
        result.push(i);
      }
    }

    this.setState({
      indexedFragments: result,
    });
  }

  render() {
    const fragments = this.state.indexedFragments;
    const plateAppearances: PlateAppearance[] = [];

    const getOutsBefore = (index: number) =>
      fragments.filter(f => f.fragment.bases === 0 && f.index < index).length;

    return (
      <div className="inning-container">
        {
        this.props.battingOrder.map((name, i) =>
          <PlateAppearance
            outsBefore={getOutsBefore(i)}
          onPlayFragment={f => this.handlePlayFragment(i, f)}
          onClearFragment={b => this.handleClearFragment(i, b)}
          fragments={fragments.filter(f => f.index == i).map(f => f.fragment)}
          />)
        }
      </div>
    )
  }
}

