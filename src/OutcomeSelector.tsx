import React, {Component} from 'react';
import SelectFielder from './SelectFielder';

type OptionResultHandler = (symbol_: string, outs: number) => void;

export interface SelectedOutcome {
  shorthand: string;
  outs: number;
  reached: boolean;
}

interface PlaySelectionOptionProps {
  symbol_: string;
  label: string;
  outs: number;
  //fielderInputs: 'none' | 'one' | 'many';
  onResult: OptionResultHandler;
}

function PlaySelectionOption(props: PlaySelectionOptionProps) {
  return (
    <li onClick={() => props.onResult(props.symbol_, props.outs)}>
      {props.label}
    </li>
  );
}

interface OutcomeSelectorProps {
  base: number;
  onSelectOutcome: (selectedOutcome: SelectedOutcome) => void;
}

enum OutcomeSelectorMode {
  Initial,
  FielderSelection,
}

interface OutcomeSelectorState {
  selectMultipleFielders: boolean | null;
  onFielderSelected?: (fielders: string) => void;
  mode: OutcomeSelectorMode;
}

export default class OutcomeSelector extends Component<OutcomeSelectorProps, OutcomeSelectorState> {
  constructor(props: OutcomeSelectorProps) {
    super(props);
    this.state = {
      selectMultipleFielders: null,
      mode: OutcomeSelectorMode.Initial
    };
  }

  // computes and returns a list of actions from this basepath that do result in
  // an out and don't require a player input
  private *generateOutsOptions() {
    const cb = (reached: boolean) =>
      (symbol_: string, outs: number) =>
        this.props.onSelectOutcome({ shorthand: symbol_, outs: outs, reached: reached });

    if (this.props.base === 0) {
      yield <PlaySelectionOption symbol_="K" label="Strikeout swinging" outs={1} onResult={cb(false)} />;
      yield <PlaySelectionOption symbol_={unescape("%uA4D8")} label="Strikeout looking" outs={1} onResult={cb(false)} />;
      yield <PlaySelectionOption symbol_="FC" label="Fielder's Choice" outs={1} onResult={cb(true)} />;
      yield <PlaySelectionOption symbol_="SAC" label="Sacrifice bunt" outs={1} onResult={cb(false)} />;
      yield <PlaySelectionOption symbol_="SF" label="Sacrifice fly" outs={1} onResult={cb(false)} />;
    }
    else {
      yield <PlaySelectionOption symbol_="CS" label="Caught Stealing" outs={1} onResult={cb(false)} />;
      yield <PlaySelectionOption symbol_="PO" label="Pick off" outs={1} onResult={cb(false)} />;
    }
  }

  // computes and returns a list of actions for this basepath that do not result
  // in an out
  private* generateNoOutsOptions() {
    const cb: OptionResultHandler = (symbol_: string, outs: number) =>
      this.props.onSelectOutcome({ shorthand: symbol_, outs: outs, reached: true });

    if (this.props.base === 0) {
      yield <PlaySelectionOption symbol_="1B" label="Single" outs={0} onResult={cb} />;
      yield <PlaySelectionOption symbol_="2B" label="Double" outs={0} onResult={cb} />;
      yield <PlaySelectionOption symbol_="3B" label="Triple" outs={0} onResult={cb} />;
      yield <PlaySelectionOption symbol_="HR" label="Home Run" outs={0} onResult={cb} />;
      yield <PlaySelectionOption symbol_="HBP" label="Hit by Pitch" outs={0} onResult={cb} />;
    }
    else {
      yield <PlaySelectionOption symbol_="SB" label="Stolen Base" outs={0} onResult={cb} />;
    }

    yield <PlaySelectionOption symbol_="BB" label="Base on Balls" outs={0} onResult={cb} />;
  }

  private renderFielderSelection() {
    if (this.state.onFielderSelected !== undefined) {
      return (
        <SelectFielder
          allowMultiple={this.state.selectMultipleFielders || false}
          onFielderSelected={this.state.onFielderSelected} />
      );
    }
  }

  render() {
    // If there's a callback for picking fielders, that means the user already
    // picked a play type.
    if (this.state.onFielderSelected) {
      return this.renderFielderSelection();
    }

    const noOuts = Array.from(this.generateNoOutsOptions());
    const outs = Array.from(this.generateOutsOptions());

    //const onSelectFielderResult = (symbol_: string, outs: number, onSelectFielder: ())

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

            <PlaySelectionOption symbol_="" label="Groundout" outs={1} onResult={(symbol_, outs) =>
              this.setState({
                selectMultipleFielders: true,
                onFielderSelected: fielders =>
                  this.props.onSelectOutcome({
                    shorthand: fielders.length == 1 ? fielders + 'U' : fielders,
                    outs: outs,
                    reached: false
                  })
              }) } />

            <PlaySelectionOption symbol_="" label="Flyout" outs={1} onResult={(symbol_, outs) =>
              this.setState({
                selectMultipleFielders: false,
                onFielderSelected: fielder => {
                  const result = fielder;
                  this.props.onSelectOutcome({ shorthand: result, outs: outs, reached: false });
                }
              })
            } />

            <PlaySelectionOption symbol_="L" label="Lineout" outs={1} onResult={(symbol_, outs) =>
              this.setState({
                selectMultipleFielders: false,
                onFielderSelected: fielder => {
                  const result = fielder;
                  this.props.onSelectOutcome({ shorthand: result, outs: outs, reached: false });
                }
              })
            } />
          </ul>
        </fieldset>
      </div>
    );
  }
}
