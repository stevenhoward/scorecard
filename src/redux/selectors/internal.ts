import { AppState } from '../types';

export const getPlays = (state: AppState) => state.plays;
export const getPlayers = (state: AppState) => state.players;
export const getFragments = (state: AppState) => state.fragments;
