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

export default class Inning extends Component<InningProps, InningState> {
  constructor(props: InningProps) {
    super(props);
    this.state = {
      indexedFragments: [],
    };
  }

  // User clicked an empty segment and we need to add it
  private handlePlayFragment(index: number, fragment: PlayFragment) {
    this.setState({
      indexedFragments: this.state.indexedFragments.concat({ index: index, fragment: fragment}),
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
        Array(3).fill(0).map((_, i) =>
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

