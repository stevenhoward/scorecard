import React, {Component, ReactNode} from 'react';
import SelectFielder from './SelectFielder';
import Dialog from './Dialog';

type OptionResultHandler = (fielders: string) => void;

export interface SelectedOutcome {
  shorthand: string;
  outs: number;
  reached: boolean;

  // How many bases did the runner advance?
  // if reached is false, this is implied to be 0
  bases?: number;
}

interface PlaySelectionOptionProps {
  // Displayed label for this option
  label: string;

  // undefined: no fielder input needed
  // 'one': select a single fielder, e.g. for a flyout.
  // 'many': select an arbitrary sequence of fielders, e.g. 6-4-3 for a DP.
  fielderInputs?: 'one' | 'many';

  onResult: OptionResultHandler;
}

interface PlaySelectionOptionState {
  showFielderSelector: boolean;
}

class PlaySelectionOption extends Component<PlaySelectionOptionProps, PlaySelectionOptionState> {
  constructor(props: PlaySelectionOptionProps) {
    super(props);
    this.state = { showFielderSelector: false };
  }

  private handleClick() {
    if (this.props.fielderInputs === undefined) {
      // If there are no fielder inputs, we're done.
      this.props.onResult('');
    }
    else {
      this.setState({ showFielderSelector: true });
    }
  }

  render() {
    return (
      <React.Fragment>
        <li onClick={() => this.handleClick()}>
          <a href="javascript: void(0)">{this.props.label}</a>
        </li>
        <Dialog visible={this.state.showFielderSelector}
          onClose={() => this.setState({showFielderSelector: false})}>
          <SelectFielder allowMultiple={this.props.fielderInputs === 'many'}
                         onFielderSelected={this.props.onResult} />
        </Dialog>
      </React.Fragment>
    );
  }
}

interface OutcomeSelectorProps {
  base: number;
  onSelectOutcome: (selectedOutcome: SelectedOutcome) => void;
}

enum OutcomeSelectorMode {
  Type,
  Player,
}

interface OutcomeSelectorState {
  mode: OutcomeSelectorMode;
  onFielderSelected: (fielders: string) => void;
  allowMultiple?: boolean;
}

export default class OutcomeSelector extends Component<OutcomeSelectorProps, OutcomeSelectorState> {
  constructor(props: OutcomeSelectorProps) {
    super(props);
    this.state = {
      mode: OutcomeSelectorMode.Type,
      onFielderSelected: () => {}
    };
  }

  private selectFielder(onResult: (fielders: string) => void) {
    this.setState({
      mode: OutcomeSelectorMode.Player,
      onFielderSelected: onResult
    });
  }

  // computes and returns a list of actions from this basepath that do result in
  // an out and don't require a player input
  private *generateOutsOptions() {
    const oso = this.props.onSelectOutcome;

    const cb = (symbol_: string, outs: number, reached: boolean, bases: number = 0) =>
      () =>
        oso({ shorthand: symbol_, outs: outs, reached: reached, bases: bases });


    if (this.props.base === 0) {
      yield <PlaySelectionOption label="Strikeout swinging" onResult={cb('K', 1, false)} />;
      yield <PlaySelectionOption label="Strikeout looking" onResult={cb(unescape("%uA4D8"), 1, false)} />;
      yield <PlaySelectionOption label="Fielder's Choice" fielderInputs="many" onResult={fielders =>
        oso({ shorthand: "FC\n" + fielders, outs: 1, reached: true, bases: 1 })
      } />;
      yield <PlaySelectionOption label="Sacrifice bunt" fielderInputs="many" onResult={fielder =>
        oso({ shorthand: "SAC\n" + fielder, outs: 1, reached: false })
      } />;
      yield <PlaySelectionOption label="Sacrifice fly" fielderInputs="one" onResult={fielder =>
        oso({ shorthand: "SF\n" + fielder, outs: 1, reached: false })
      } />;
      yield <PlaySelectionOption label="Groundout" fielderInputs="many" onResult={fielders =>
        oso({ shorthand: fielders.length == 1 ? fielders + 'U' : fielders, outs: 1, reached: false })
      } />;

      yield <PlaySelectionOption label="Flyout" fielderInputs="one" onResult={fielder =>
        oso({ shorthand: fielder, outs: 1, reached: false })
      } />

      yield <PlaySelectionOption label="Lineout" fielderInputs="one" onResult={fielder =>
        oso({ shorthand: 'L' + fielder, outs: 1, reached: false })
      } />

      yield <PlaySelectionOption label="Grounded into double play" fielderInputs="many" onResult={fielders =>
        oso({ shorthand: fielders + ' DP', outs: 2, reached: false })
      } />
    }
    else {
      yield <PlaySelectionOption label="Caught Stealing" onResult={cb('CS', 1, false)} />;
      yield <PlaySelectionOption label="Pick off" onResult={cb('PO', 1, false)} />;
    }
  }

  // computes and returns a list of actions for this basepath that do not result
  // in an out
  private* generateNoOutsOptions() {
    const cb = (symbol_: string, bases: number) =>
      () =>
        this.props.onSelectOutcome({ shorthand: symbol_, outs: 0, reached: true, bases: bases });

    if (this.props.base === 0) {
      yield <PlaySelectionOption label="Single" onResult={cb('1B', 1)} />;
      yield <PlaySelectionOption label="Double" onResult={cb('2B', 2)} />;
      yield <PlaySelectionOption label="Triple" onResult={cb('3B', 3)} />;
      yield <PlaySelectionOption label="Home Run" onResult={cb('HR', 4)} />;
      yield <PlaySelectionOption label="Hit by Pitch" onResult={cb('HBP', 1)} />;
    }
    else {
      yield <PlaySelectionOption label="Stolen Base" onResult={cb('SB', 1)} />;
    }

    yield <PlaySelectionOption label="Base on Balls" onResult={cb('BB', 1)} />;
  }

  render() {
    const noOuts = Array.from(this.generateNoOutsOptions());
    const outs = Array.from(this.generateOutsOptions());

    if (this.state.mode == OutcomeSelectorMode.Type) {
      return (
        <div style={{textAlign: 'left'}}>
          <fieldset>
            <legend>No outs</legend>
            <ul>
              {noOuts}

            </ul>
          </fieldset>

          <fieldset>
            <legend>Outs</legend>
            <ul>
              {outs}

            </ul>
          </fieldset>
        </div>
      );
    }
    else {
      return <SelectFielder allowMultiple={this.state.allowMultiple || false} onFielderSelected={this.state.onFielderSelected} />
    }
  }
}
