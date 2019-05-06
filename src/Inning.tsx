import React, { Component } from 'react';
import {connect} from 'react-redux';
import {addPlay, clearFrom, advanceRunner} from './redux/actions';
import PlateAppearance from './PlateAppearance';
import {AppState, Play, PlayFragment} from './redux/types';

interface InningProps {
  addPlay: typeof addPlay;
  clearFrom: typeof clearFrom;
  advanceRunner: typeof advanceRunner;
  plays: Play[]

  inningNumber: number;
}

class Inning extends Component<InningProps, {}> {
  render() {
    const fragments: PlayFragment[] = this.props.plays.flatMap(p => p.fragments);

    const getOutsBefore = (index: number) =>
      fragments.filter(f => f.bases === 0 && f.index < index).length;

    const maxIndex = fragments.length ? Math.max.apply(null, fragments.map(f => f.index)) + 1 : 0;

    // 9 cells with data = new column for 10th.
    const cells = Math.ceil((maxIndex + 1) / 9) * 9;

    const plateAppearances = Array(cells).fill(null).map((_, i) =>
      <PlateAppearance
        outsBefore={getOutsBefore(i)}
        onPlayFragment={this.props.addPlay.bind(this)}
        onClearFragment={this.props.clearFrom.bind(this)}
        advanceRunner={this.props.advanceRunner.bind(this)}
        fragments={fragments.filter(f => f.index == i)}
        rbis={this.props.plays[i] ? this.props.plays[i].rbis : 0}
        key={i}
        index={i}
        enabled={i <= maxIndex}
      />);

    const columns = [];
    for (let i = 0; i < plateAppearances.length; i += 9) {
      columns.push(<div className="inning-column" key={i}>{plateAppearances.slice(i, i + 9)}</div>);
    }

    return (
      <div className="inning-container">
        <div className="inning-header">{this.props.inningNumber}</div>
        <div className="inning-columns">
          {columns}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state: AppState) {
  return {
    plays: state.plays,
  };
}

export default connect(mapStateToProps, {addPlay, clearFrom, advanceRunner})(Inning);
