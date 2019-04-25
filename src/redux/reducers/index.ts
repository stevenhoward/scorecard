import {combineReducers} from 'redux';
import {playReducer} from './plays';

export default combineReducers({ plays: playReducer });
