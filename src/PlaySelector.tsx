import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { AppState, PlayOption, PlayOutcome, PlayFragment } from './redux/types';
import { OutcomeTypes } from './outcomeTypes';
import { runnersSelector } from './redux/selectors';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';

export interface OwnProps {
  // Runner index
  index: number;

  // Are we moving a runner or batting?
  onBase: boolean;

  //
  addPlay: (fragment: PlayFragment) => void;
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
  pendingFielder?: PlayOption;
}

class PlaySelector extends Component<PlaySelectorProps, PlaySelectorState> {
  constructor(props: PlaySelectorProps) {
    super(props);
    this.state = { pendingFielder: undefined };
  }

  private onCompletedOutcome(option: PlayOption, fielder='') {
    const { runners, index } = this.props;

    const outcome: PlayOutcome = {
      ...option,
      runnerIndex: index,
      label: option.resultText(fielder),
    };

    this.props.addPlay(outcome);
  }

  private outcomeSelected(outcome: PlayOption) {
    if (outcome.fielderInputs === undefined) {
      this.onCompletedOutcome(outcome);
    }
    else {
      this.setState({ pendingFielder: outcome });
    }
  }

  private onFielder(fielder: string) {
    const option = this.state.pendingFielder;
    if (!option) { throw new Error('should not happen'); }
    this.onCompletedOutcome(option, fielder);
  }

  render() {
    if (this.state.pendingFielder !== undefined) {
      const {fielderInputs} = this.state.pendingFielder;

      return <SelectFielder
        onFielderSelected={this.onFielder.bind(this)}
        allowMultiple={fielderInputs == 'many'} />;
    }

    let advanceOutcomes: any[] = this.props.succeedingBatters.map(batterIndex => {
      const outcome: PlayOption = {
        name: `Advanced by batter ${batterIndex}`,
        resultText: () => `#${batterIndex}`,
        bases: 1,
      };

      return <li key={outcome.name} onClick={() => this.onCompletedOutcome(outcome)}>{outcome.name}</li>
    });

    // this name is terrible. Outcomes not related to an advancing runner
    const possibleOutcomes = OutcomeTypes.filter(outcome =>
      outcome.onBase === undefined || outcome.onBase === this.props.onBase);

    const otherOutcomes = possibleOutcomes.map(outcome => {
      const { available, name } = outcome;

      // e.g., can't have a fielder's choice without a runner, can't have a sac
      // fly with nobody at third
      if (available !== undefined && !available(this.props.runners)) {
        return null;
      }

      return <li key={name} onClick={() => this.outcomeSelected(outcome)}>{name}</li>
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
