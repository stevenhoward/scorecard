import React, { Component } from 'react';
import PlateAppearance from './PlateAppearance';
import SelectFielder from './SelectFielder';
import './App.css';

/*

// yeah, yeah, YAGNI, but this is an early work in progress.
// Currently focused on rendering each plate appearance.

enum Handedness {
  Left,
  Right,
  Switch
}

interface PlayerProps {
  name: string;
  jerseyNumber: number;
  bats: Handedness;
}

interface SlotProps {
  // First player is in the starting lineup. Players 2 through N are
  // substitutions
  players: PlayerProps[];
}

function Slot(props: SlotProps) {
  return props.players.map(player => (
    <tr>
      <td>{player.name}</td>
      <td>{player.jerseyNumber}</td>
      <td>{player.bats}</td>
    </tr>
  ));
}

interface PlayerInputProps {
  dataListId: string;
}

interface PlayerInputState {
  playerName: string;
}

class PlayerInput extends Component<PlayerInputProps, PlayerInputState> {
  constructor(props: PlayerInputProps) {
    super(props);
    this.state = { playerName: '' };
  }

  handleChange(event: any) {
    this.setState({ playerName: event.target.value });
  }

  render() {
    const name = this.state.playerName;
    return (
      <input type="text"
      placeholder="Player name"
      value={name}
      onChange={e => this.handleChange(e)}
      list={this.props.dataListId} />
    );
  }
}

interface ScoreSheetProps {
  team: string;
  roster: PlayerData[];
}

class ScoreSheet extends Component<ScoreSheetProps, {}> {
  constructor(props: ScoreSheetProps) {
    super(props);

    this.state = {
      slots: Array(9).fill(null),
    };
  }

  render() {
    const dataListId = this.props.team + "_roster";
    return (
      <div className="scoresheet">
        <h1>{this.props.team}</h1>
        <datalist id={dataListId}>
          {
          this.props.roster.map((player, index) => (
            <option value={player.name} />
          ))
          }
        </datalist>
        <table>
          <tr>
            <th>Player</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>6</th>
            <th>7</th>
            <th>8</th>
            <th>9</th>
          </tr>
          {
            Array(9).fill(null).map((name, index) => (
              <tr>
                <td><PlayerInput dataListId={dataListId} /></td>
              </tr>
              ))
          }
        </table>
      </div>
    );
  }
}

interface GameProps {
  homeTeam: string;
  awayTeam: string;
}

class Game extends Component<GameProps, {}> {
  constructor(props: GameProps) {
    super(props);
  }

  render() {
    return (
      <div className="scoresheet-container">
        <div className="scoresheet-home">
          <ScoreSheet team={this.props.homeTeam} roster={teams[this.props.homeTeam]}/>
        </div>
        <div className="scoresheet-away">
          <ScoreSheet team={this.props.awayTeam} roster={teams[this.props.awayTeam]}/>
        </div>
      </div>
    );
  }
}
*/

class App extends Component {
  render() {
    return (
      <div className="App">
        <PlateAppearance />
      </div>
    );
  }
}

export default App;
