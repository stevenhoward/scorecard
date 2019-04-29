import 'core-js';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {playReducer} from './redux/reducers/plays';
import {store} from './redux/store';
import {addPlay, advanceRunner, clearFrom} from './redux/actions';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('adds a play', () => {
  const fragment = { index: 0, fragment: { bases: 1, label: '1B' } };
  expect(playReducer([], addPlay(fragment))).
    toEqual([{ index: 0, fragments: [fragment] }]);
});

it('adds a double', () => {
  const fragment = { index: 0, fragment: { bases: 2, label: '2B' } };
  expect(playReducer([], addPlay(fragment))).
    toEqual([{ index: 0, fragments: [fragment] }]);
});

it('forces runners', () => {
  const fragments = [
    { index: 0, fragment: { bases: 1, label: '1B' } },
    { index: 1, fragment: { bases: 1, label: '1B' } },
    { index: 2, fragment: { bases: 1, label: 'BB' } },
  ];

  let result = fragments.reduce(
    (state, fragment) => playReducer(state, addPlay(fragment)),
    []);

  expect(result).toEqual([
    {
      fragments: [
        { index: 0, fragment: { bases: 1, label: "1B" } },
      ],
      index: 0,
    },
    {
      fragments: [
        { index: 1, fragment: { bases: 1, label: "1B" } },
        { index: 0, fragment: { bases: 1, label: "1" } },
      ],
      index: 1,
    },
    {
      fragments: [
        { index: 2, fragment: { bases: 1, label: "BB" } },
        { index: 1, fragment: { bases: 1, label: "BB" } },
        { index: 0, fragment: { bases: 1, label: "BB" } },
      ],
      index: 2,
    },
  ]);
});

it("clears runners correctly", () => {
  const fragments = [
    { index: 0, fragment: { bases: 1, label: "1B" } },
    { index: 1, fragment: { bases: 1, label: "1B" } }
  ];

  const initial = fragments.reduce(
    (state, fragment) => playReducer(state, addPlay(fragment)),
    []);

  const result = playReducer(initial, clearFrom(1, 0));
  expect(result).toEqual(initial.slice(0, 1));
});

it("advances runners extra bases", () => {
  const fragments = [
    { index: 0, fragment: { bases: 1, label: "1B" } },
    { index: 1, fragment: { bases: 1, label: "1B" } }
  ];

  const initial = fragments.reduce(
    (state, fragment) => playReducer(state, addPlay(fragment)),
    []);

  const result = playReducer(initial, advanceRunner(0, 1, 2));
  expect(result).toEqual([
    {
      fragments: [
        { index: 0, fragment: { bases: 1, label: "1B" } },
      ],
      index: 0,
    },
    {
      fragments: [
        { index: 1, fragment: { bases: 1, label: "1B" } },
        { index: 0, fragment: { bases: 2, label: "1" } },
      ],
      index: 1,
    },
  ]);
});
