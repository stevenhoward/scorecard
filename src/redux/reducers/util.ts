import { AppState, TeamState } from '../types';

// Sets properties on the 'current' team (batting)
export function setForActiveTeam(appState: AppState, newTeamState: TeamState) : AppState {
  if (appState.activeTeam == 'away') {
    return { ...appState, away: newTeamState };
  }
  else {
    return { ...appState, home: newTeamState };
  }
}
