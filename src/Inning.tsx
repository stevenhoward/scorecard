import React, { Component } from 'react';
import {connect} from 'react-redux';
import {addPlay, clearFrom} from './redux/actions';
import PlateAppearance from './PlateAppearance';
import {AppState, IndexedPlayFragment, Play, PlayFragment} from './redux/types';

interface InningProps {
  battingOrder: any[];
  addPlay: typeof addPlay;
  clearFrom: typeof clearFrom;
  plays: Play[]
}

class Inning extends Component<InningProps, {}> {
  render() {
    const fragments: IndexedPlayFragment[] = this.props.plays.flatMap(p => p.fragments);

    const getOutsBefore = (index: number) =>
      fragments.filter(f => f.fragment.bases === 0 && f.index < index).length;

    const maxIndex = fragments.length ? Math.max.apply(null, fragments.map(f => f.index)) + 1 : 0;

    const cells = Math.ceil((maxIndex + 1) / 9) * 9;

    return (
      <div className="inning-container">
        {
        Array(cells).fill(null).map((_, i) =>
          <PlateAppearance
            outsBefore={getOutsBefore(i)}
            onPlayFragment={f => this.props.addPlay({index: i, fragment: f})}
            onClearFragment={b => this.props.clearFrom(i, b)}
            fragments={fragments.filter(f => f.index == i).map(f => f.fragment)}
            key={i}
            index={i}
            enabled={i <= maxIndex}
          />)
        }
      </div>
    )
  }
}

function mapStateToProps(state: AppState) {
  return {
    plays: state.plays,
  };
}

export default connect(mapStateToProps, {addPlay, clearFrom})(Inning);
