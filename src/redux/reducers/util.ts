import { AppState, TeamState } from '../types';
import { getBattingTeam } from '../selectors';

function setForTeam(appState: AppState, newTeamState: Partial<TeamState>, team: 'home' | 'away') {
  if (team == 'away') {
    const away = { ...appState.away, ...newTeamState };
    return { ...appState, away };
  }
  else {
    const home = { ...appState.home, ...newTeamState };
    return { ...appState, home };
  }
}

// Setting for the team that's batting: useful for adding plays and fragments
export function setForBattingTeam(appState: AppState, newTeamState: Partial<TeamState>) : AppState {
  return setForTeam(appState, newTeamState, getBattingTeam(appState));
}

// Setting for the display team: currently useful for entering players
export function setForDisplayTeam(appState: AppState, newTeamState: Partial<TeamState>)
  : AppState {
  return setForTeam(appState, newTeamState, appState.displayTeam);
}
