import React, {Component, ReactNode} from 'react';
import {connect} from 'react-redux';

import {AppState,PlayFragment} from './redux/types';
import {PlayOutcome,OutcomeTypes} from './outcomeTypes';
import {runnersSelector} from './redux/selectors';

import SelectFielder from './SelectFielder';
import Dialog from './Dialog';

interface PlaySelectorProps {
  // 3-tuple indicating the numbers of players on base
  runners: number[];

  // Returns the selected play
  onPlayFragment: (playFragment: PlayFragment) => void;
}

interface PlaySelectorState {
  pendingFielder?: PlayOutcome;
}

class PlaySelector extends Component<PlaySelectorProps, PlaySelectorState> {
  constructor(props: PlaySelectorProps) {
    super(props);
    this.state = { pendingFielder: undefined };
  }

  private outcomeSelected(outcome: PlayOutcome) {
    if (outcome.fielderInputs === undefined) {
      this.props.onPlayFragment({
        bases: outcome.bases,
        label: outcome.resultText(''),
      });
    }
    else {
      this.setState({ pendingFielder: outcome });
    }
  }

  private onFielder(fielder: string) {
    const outcome = this.state.pendingFielder;

    if (!outcome) { throw new Error('should not happen'); }

    this.props.onPlayFragment({
      bases: outcome.bases,
      label: outcome.resultText(fielder),
    });
  }

  render() {
    if (this.state.pendingFielder !== undefined) {
      const {fielderInputs} = this.state.pendingFielder;

      return <SelectFielder
        onFielderSelected={this.onFielder.bind(this)}
        allowMultiple={fielderInputs == 'many'} />;
    }

    const outcomes = OutcomeTypes.map(outcome => {
      // e.g., can't have a fielder's choice without a runner, can't have a sac
      // fly with nobody at third
      if (outcome.available !== undefined && !outcome.available(this.props.runners)) {
        return null;
      }

      return <li key={outcome.label} onClick={() => this.outcomeSelected(outcome)}>{outcome.label}</li>
    });

    return <ul>{outcomes}</ul>;
  }
}

function mapStateToProps(state: AppState) {
  return {
    runners: runnersSelector(state),
  };
}

export default connect(mapStateToProps)(PlaySelector);
