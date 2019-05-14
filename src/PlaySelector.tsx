import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { AppState, AvailabilityFilter, PlayOption, PlayOutcome, PlayFragment } from './redux/types';
import { OutcomeTypes } from './outcomeTypes';
import { getOutsInInning, getBaseRunners } from './redux/selectors';

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

  // Number of outs in the inning
  outsInInning: number;
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

    const { runners, outsInInning, onBase } = this.props;

    const otherOutcomes = OutcomeTypes.
      filter(outcome => {
        if (outcome.available !== undefined) {
          const filters = ([] as AvailabilityFilter[]).concat(outcome.available);
          for (const filter of filters) {
            // TODO: consistency
            const isBatter = !onBase;
            if (!filter({ runners, outs: outsInInning, isBatter })) {
              return false;
            }
          }
        }

        return true;
      });

    const [ nonOuts, outs ] = [...advanceOutcomes, ...otherOutcomes].reduce(
      (rv, outcome) => {
        const madeOut = outcome.bases === 0 ? 1 : 0;
        rv[madeOut] = [...rv[madeOut], outcome];
        return rv;
      },
      [ [] as PlayOption[], [] as PlayOption[] ],
    );

    const renderOption = (outcome: PlayOption) => {
      const { name } = outcome;
      return <li key={name} onClick={() => this.outcomeSelected(outcome)}>{name}</li>
    };

    return (
      <div className="play-types">
        <fieldset>
          <legend>No outs</legend>
          <ul> {nonOuts.map(renderOption)} </ul>
        </fieldset>
        <fieldset>
          <legend>Outs</legend>
          <ul> {outs.map(renderOption)} </ul>
        </fieldset>
      </div>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): StateProps {
  const { index } = ownProps;

  return {
    runners: getBaseRunners(state),
    outsInInning: getOutsInInning(state),
    succeedingBatters: state.plays.filter(p => p.index > index).map(p => p.index),
  };
}

export default connect(mapStateToProps)(PlaySelector);
