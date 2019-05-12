import React, {Component, ReactNode} from 'react';
import {connect} from 'react-redux';

import {AppState,PlayFragment} from './redux/types';
import {PlayOutcome,OutcomeTypes} from './outcomeTypes';
import {runnersSelector} from './redux/selectors';
import {addPlay, advanceRunner} from './redux/actions';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';

export interface OwnProps {
  // Runner index
  index: number;

  // Are we moving a runner or batting?
  onBase: boolean;

  //
  addPlay: (fragment: PlayFragment) => void;

  // Moves a runner over on the bases
  advanceRunner: (runnerIndex: number, batterIndex: number, bases: number) => void;
}

interface StateProps {
  // 3-tuple indicating the numbers of players on base
  runners: number[];

  // List of batters who put a ball in play and could advance a runner
  succeedingBatters: number[];
}

interface DispatchProps {
}

type PlaySelectorProps = OwnProps & DispatchProps & StateProps;

interface PlaySelectorState {
  pendingFielder?: PlayOutcome;
}

class PlaySelector extends Component<PlaySelectorProps, PlaySelectorState> {
  constructor(props: PlaySelectorProps) {
    super(props);
    this.state = { pendingFielder: undefined };
  }

  private onCompletedOutcome(outcome: PlayOutcome) {
    this.props.addPlay({
      runnerIndex: this.props.index,
      bases: outcome.bases,
      label: outcome.resultText(''),
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

    let advanceOutcomes: any[] = this.props.succeedingBatters.map(batterIndex => {
        const outcome: PlayOutcome = {
          label: `Advanced by batter ${batterIndex}`,
          resultText: () => `#${batterIndex}`,
          bases: 1,
        };

      return <li key={outcome.label} onClick={() => this.advanceRunner(batterIndex)}>{outcome.label}</li>
    });

    // this name is terrible. Outcomes not related to an advancing runner
    const possibleOutcomes = OutcomeTypes.filter(outcome =>
      outcome.onBase === undefined || outcome.onBase === this.props.onBase);

    const otherOutcomes = possibleOutcomes.map(outcome => {
      const { available, label } = outcome;

      // e.g., can't have a fielder's choice without a runner, can't have a sac
      // fly with nobody at third
      if (available !== undefined && !available(this.props.runners)) {
        return null;
      }

      return <li key={label} onClick={() => this.outcomeSelected(outcome)}>{label}</li>
    });

    return <ul className="play-types">{[...advanceOutcomes, ...otherOutcomes]}</ul>;
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): StateProps {
  const { index } = ownProps;

  return {
    runners: runnersSelector(state),
    succeedingBatters: state.plays.filter(p => p.index > index).map(p => p.index),
  };
}

export default connect(mapStateToProps)(PlaySelector);
