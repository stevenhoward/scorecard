import React, { Component } from 'react';
import {connect} from 'react-redux';
import PlateAppearance from './PlateAppearance';
import {AppState, Play, PlayFragment} from './redux/types';
import {getCurrentInning} from './redux/selectors';

interface InningProps {
  plays: Play[]

  inningNumber: number;
}

class Inning extends Component<InningProps, {}> {
  render() {
    const fragments: PlayFragment[] = this.props.plays.flatMap(p => p.fragments);

    const getOutsBefore = (index: number) =>
      fragments.filter(f => f.bases === 0 && f.runnerIndex < index).length;

    const maxIndex = fragments.length
      ? Math.max.apply(null, this.props.plays.map(play => play.index)) + 1
      : 0;

    // 9 cells with data = new column for 10th.
    const cells = Math.ceil((maxIndex + 1) / 9) * 9;

    const plateAppearances = Array(cells).fill(null).map((_, i) =>
      <PlateAppearance
        outsBefore={getOutsBefore(i)}
        fragments={fragments.filter(f => f.runnerIndex == i)}
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
    plays: getCurrentInning(state),
  };
}

export default connect(mapStateToProps)(Inning);
