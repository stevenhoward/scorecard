import React, {Component, ReactNode} from 'react';
import {connect} from 'react-redux';

import {AppState,PlayFragment} from './redux/types';
import {PlayOutcome,OutcomeTypes} from './outcomeTypes';
import {runnersSelector} from './redux/selectors';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';

interface PlaySelectorProps {
  // Batter index
  index: number;

  // 3-tuple indicating the numbers of players on base
  runners: number[];

  // List of batters who put a ball in play and could advance a runner
  succeedingBatters: number[];

  // Returns the selected play
  onPlayFragment: (playFragment: PlayFragment) => void;

  //
  advanceRunner: (runnerIndex: number, batterIndex: number, bases: number) => void;
}

interface PlaySelectorState {
  pendingFielder?: PlayOutcome;
}

class PlaySelector extends Component<PlaySelectorProps, PlaySelectorState> {
  constructor(props: PlaySelectorProps) {
    super(props);
    this.state = { pendingFielder: undefined };
  }

  private onCompletedOutcome(outcome: PlayOutcome) {
    this.props.onPlayFragment({
      bases: outcome.bases,
      label: outcome.resultText(''),
      hit: !!outcome.hit,
    });

    const { runners, index } = this.props;

    if (outcome.label == "Sacrifice Bunt") {
      if (runners.filter(b => b !== undefined).length === 1) {
        const runner = runners.find(b => b !== undefined);
        if (runner === undefined) { throw new Error('should not happen'); }
        this.props.advanceRunner(runner, index, 1);
      }
    }
    else if (outcome.label == "Sacrifice fly") {
      this.props.advanceRunner(runners[2], index, 1);
    }
  }

  private outcomeSelected(outcome: PlayOutcome) {
    if (outcome.fielderInputs === undefined) {
      this.onCompletedOutcome(outcome);
    }
    else {
      this.setState({ pendingFielder: outcome });
    }
  }

  private onFielder(fielder: string) {
    const outcome = this.state.pendingFielder;
    if (!outcome) { throw new Error('should not happen'); }
    this.onCompletedOutcome(outcome);
  }

  private advanceRunner(batterIndex: number) {
    this.props.advanceRunner(this.props.index, batterIndex, 1);
  }

  render() {
    if (this.state.pendingFielder !== undefined) {
      const {fielderInputs} = this.state.pendingFielder;

      return <SelectFielder
        onFielderSelected={this.onFielder.bind(this)}
        allowMultiple={fielderInputs == 'many'} />;
    }

    let outcomes: any[] = this.props.succeedingBatters.map(batterIndex => {
        const outcome: PlayOutcome = {
          label: `Advanced by batter ${batterIndex}`,
          resultText: () => `#${batterIndex}`,
          bases: 1,
        };

      return <li key={outcome.label} onClick={() => this.advanceRunner(batterIndex)}>{outcome.label}</li>
      });

    outcomes = [...outcomes, OutcomeTypes.map(outcome => {
      // e.g., can't have a fielder's choice without a runner, can't have a sac
      // fly with nobody at third
      if (outcome.available !== undefined && !outcome.available(this.props.runners)) {
        return null;
      }

      return <li key={outcome.label} onClick={() => this.outcomeSelected(outcome)}>{outcome.label}</li>
    })];

    return <ul className="play-types">{outcomes}</ul>;
  }
}

function mapStateToProps(state: AppState, ownProps: PlaySelectorProps) {
  const { index } = ownProps;

  return {
    runners: runnersSelector(state),
    succeedingBatters: state.plays.filter(p => p.index > index).map(p => p.index),
  };
}

export default connect(mapStateToProps)(PlaySelector);
