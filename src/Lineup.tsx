import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addPlayer } from './redux/actions';
import { AppState,Player } from './redux/types';

export interface OwnProps {
}

interface StateProps {
  players: Player[];
}

type LineupProps = OwnProps & StateProps;

function Slot(props: Player) {
  const { name, jerseyNumber } = props || { name: '', jerseyNumber: undefined };

  return (
    <div className="player-line">
      <input type="text" className="player-name" value={name} />
      <input type="text" className="jersey-number" value={jerseyNumber} />
    </div>
  );
}

class Lineup extends Component<LineupProps, {}> {
  render() {
    const { players } = this.props;

    const slots = Array(9).fill(null).map((_, i) => (
      <div className="slot" key={i}>
        <span className="slotNumber">{i + 1}. </span>
        <Slot {...players[i]} />
      </div>
    ));

    return (
      <div className="lineup">
        <header>
          <span className="player-name">Player</span>
          <span className="jersey-number">#</span>
        </header>
        {slots}
      </div>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): StateProps {
  return { players: state.players };
}

export default connect(mapStateToProps, { addPlayer })(Lineup);
