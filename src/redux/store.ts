import {createStore, applyMiddleware} from 'redux';
import rootReducer from './reducers';

function logger({ getState }: {getState: () => any}) {
  return (next: any) => (action: any) => {
    console.log('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)

    const { present } = getState();
    console.log('state after dispatch', present)

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

export const store = createStore(rootReducer, applyMiddleware(logger));
