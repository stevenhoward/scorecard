// todo: isn't this bullshit what Babel is for? npm run works; npm test doesn't.
if (!Array.prototype.flat) {
  Array.prototype.flat = function() {
    var depth = arguments[0];
    depth = depth === undefined ? 1 : Math.floor(depth);
    if (depth < 1) return Array.prototype.slice.call(this);
    return (function flat(arr, depth) {
      var len = arr.length >>> 0;
      var flattened = [];
      var i = 0;
      while (i < len) {
        if (i in arr) {
          var el = arr[i];
          if (Array.isArray(el) && depth > 0)
            flattened = flattened.concat(flat(el, depth - 1));
          else flattened.push(el);
        }
        i++;
      }
      return flattened;
    })(this, depth);
  };
}

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function() {
    return Array.prototype.map.apply(this, arguments).flat(1);
  };
}

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {playReducer} from './redux/reducers/plays';
import {store} from './redux/store';
import {addPlay, clearFrom} from './redux/actions';

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

  let result = [];
  for (const f of fragments) {
    result = playReducer(result, addPlay(f));
  }

  expect(result).toEqual([
    {
      fragments: [
        {
          fragment: { bases: 1, label: "1B", },
          index: 0,
        },
      ],
      index: 0,
    },
    {
      fragments: [
        {
          fragment: { bases: 1, label: "1B", },
          index: 1,
        },
        {
          fragment: { bases: 1, label: "1", },
          index: 0,
        },
      ],
      index: 1,
    },
    {
      fragments: [
        {
          fragment: { bases: 1, label: "BB", },
          index: 2,
        },
        {
          fragment: { bases: 1, label: "BB", },
          index: 1,
        },
        {
          fragment: { bases: 1, label: "BB", },
          index: 0,
        },
      ],
      index: 2,
    },
  ]);
});

it("clears runners correctly", () => {
  const initial = [
    {
      fragments: [
        {
          fragment: { bases: 1, label: "1B", },
          index: 0,
        },
      ],
      index: 0,
    },
    {
      fragments: [
        {
          fragment: { bases: 1, label: "1B", },
          index: 1,
        },
        {
          fragment: { bases: 1, label: "1", },
          index: 0,
        },
      ],
      index: 1,
    },
  ];

  const result = playReducer(initial, clearFrom(1, 0));
  expect(result).toEqual(initial.slice(0, 1));
});
