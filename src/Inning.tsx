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

class Inning extends Component<InningProps, {}> {
  render() {
    const fragments = this.props.indexedFragments;

    const getOutsBefore = (index: number) =>
      fragments.filter(f => f.fragment.bases === 0 && f.index < index).length;

    const maxIndex = fragments.length ? Math.max.apply(null, fragments.map(f => f.index)) + 1 : 0;
    const outs = fragments.filter(f => f.fragment.bases == 0).length;
    let lastOut: number|null = null;
    if (outs == 3) {

    }

    return (
      <div className="inning-container">
        {
        this.props.battingOrder.map((name, i) =>
          <PlateAppearance
            outsBefore={getOutsBefore(i)}
            onPlayFragment={f => this.props.addPlay({index: i, fragment: f})}
            onClearFragment={b => this.props.clearFrom(i, b)}
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
