import { setIn, getIn } from './utils';

let state = {};
let listeners = [];

export function getState(path = []) {
  return getIn(state, path, state);
}

export function setState(mutation) {
  if (!mutation) {
    throw new Error('No mutation');
  }

  const { path = [], newValue } = mutation;

  if (!path.length) {
    throw new Error('Empty path in mutation');
  }

  state = setIn(state, path, newValue);

  listeners.forEach(function execute(currentListener) {
    currentListener(state);
  });
}

export function subscribeListener(listener) {
  listeners.push(listener);
}

export function unsubscribeListener(listener) {
  const out = [];

  listeners.forEach(function mayUnsubscribe(currentListener) {
    if (currentListener === listener) {
      listener = null;
    } else {
      out.push(currentListener);
    }
  });

  listeners = out;
}

export function initialize(initialState = {}) {
  state = initialState;
}

export function unsubscribeAllListeners() {
  listeners = [];
}
