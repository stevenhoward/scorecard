import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';

import { AppState, AvailabilityFilter, PlayOption, PlayOutcome, PlayFragment } from '../redux/types';
import { OutcomeTypes } from './outcomeTypes';
import { getPlays, getOutsInInning, getBaseRunners } from '../redux/selectors';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';

export interface OwnProps {
  // Runner index
  index: number;

  // Are we moving a runner or batting?
  onBase: boolean;

  //
  addPlay: (outcome: PlayOutcome) => void;
}

interface StateProps {
  // 3-tuple indicating the numbers of players on base
  runners: [ number, number, number ];

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

  private getAvailableOutcomes() {
    const { runners, outsInInning, onBase } = this.props;

    return OutcomeTypes.
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
  }

  private getSucceedingBatterOutcomes(): PlayOption[] {
    return this.props.succeedingBatters.flatMap(batterIndex => {
      return [
        {
          name: `Advanced by batter ${batterIndex}`,
          resultText: () => `#${batterIndex}`,
          bases: 1,
        },
        {
          name: `Out on batter ${batterIndex}`,
          resultText: () => `#${batterIndex}`,
          bases: 0,
          outs: 1,
        }
      ];
    });
  }

  render() {
    if (this.state.pendingFielder !== undefined) {
      const {fielderInputs} = this.state.pendingFielder;

      return <SelectFielder
        onFielderSelected={this.onFielder.bind(this)}
        allowMultiple={fielderInputs == 'many'} />;
    }

    const succeedingBatterOutcomes = this.getSucceedingBatterOutcomes();
    const otherOutcomes = this.getAvailableOutcomes();

    // Group options together under 'non-outs' and 'outs'
    const [ nonOuts, outs ] = [...succeedingBatterOutcomes, ...otherOutcomes].reduce(
      (rv, outcome) => {
        const madeOut = outcome.outs !== undefined ? 1 : 0;
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

function mapStateToProps({ present: state } : { present: AppState }, ownProps: OwnProps): StateProps {
  const { index } = ownProps;

  return {
    runners: getBaseRunners(state),
    outsInInning: getOutsInInning(state),
    succeedingBatters: getPlays(state).filter(p => p.index > index).map(p => p.index),
  };
}

export default connect(mapStateToProps)(PlaySelector);
