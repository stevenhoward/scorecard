import React, { Component } from 'react';
import {connect} from 'react-redux';
import {AppState} from './redux/reducers';
import {addPlay, clearFrom} from './redux/actions';
import PlateAppearance from './PlateAppearance';
import {IndexedPlayFragment, PlayFragment} from './redux/types';

interface InningProps {
  battingOrder: any[];
  addPlay: typeof addPlay;
  clearFrom: typeof clearFrom;
  indexedFragments: IndexedPlayFragment[];
}

// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-a-array-of-objects
function groupBy<T>(xs: T[], key: string): Array<Array<T>>  {
  return Object.values(xs.reduce(function(rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {}));
};

class Inning extends Component<InningProps, {}> {
  private getTotalBases() : {index: number, bases: number}[] {
    return groupBy(this.props.indexedFragments, 'index').
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

  private* getForcedRunners(index: number, numBases: number) : IterableIterator<{index: number, base: number}> {
    const runners = this.getBaseRunners();
    let base = 1;
    for (const runner of runners) {
      while (base < runner.base) {
        ++base;
        --numBases;
      }

      if (numBases > 0 && runner.index > index) {
        yield runner;
      }
    }
  }

  // User clicked an empty segment and we need to add it
  private handlePlayFragment(index: number, fragment: PlayFragment) {
    let fragments = this.props.indexedFragments.
      concat({ index: index, fragment: fragment});
    this.props.addPlay({index, fragment});

    if (fragment.bases > 0) {
      const name = this.props.battingOrder[index % this.props.battingOrder.length];
      const label = fragment.label == 'BB' ? fragment.label : name;
      const forcedRunners = Array.from(this.getForcedRunners(index, fragment.bases)).map(runner => {
        return {
          index: runner.index,
          fragment: {
            label: label,
            bases: fragment.bases,
          }
        };
      });

      for (const runner of forcedRunners) {
        this.props.addPlay(runner);
      }
    }
  }

  // The user clicked a filled in segment and we need to remove it from the data
  private handleClearFragment(index: number, base: number) {
    this.props.clearFrom(index, base);
  }

  render() {
    const fragments = this.props.indexedFragments;

    const getOutsBefore = (index: number) =>
      fragments.filter(f => f.fragment.bases === 0 && f.index < index).length;

    const maxIndex = fragments.length ? Math.max.apply(null, fragments.map(f => f.index)) + 1 : 0;
    const outs = fragments.filter(f => f.fragment.bases == 0).length;
    let lastOut: number|null = null;
    if (outs == 3) {

    }
    console.log(maxIndex);

    return (
      <div className="inning-container">
        {
        this.props.battingOrder.map((name, i) =>
          <PlateAppearance
            outsBefore={getOutsBefore(i)}
            onPlayFragment={f => this.handlePlayFragment(i, f)}
            onClearFragment={b => this.handleClearFragment(i, b)}
            fragments={fragments.filter(f => f.index == i).map(f => f.fragment)}
            key={i}
            enabled={i <= maxIndex}
          />)
        }
      </div>
    )
  }
}

function mapStateToProps(state: AppState) {
  return {
    indexedFragments: state
  };
}

export default connect(mapStateToProps, {addPlay, clearFrom})(Inning);
