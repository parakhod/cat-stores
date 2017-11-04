import { getReducerName } from 'redux-feline-actions'

const h401 = state => state.setIn(['_signals', 'authError'], true);

const handleAction = (name, reducer, options = {}) => (state, action) => {

  const { prefix } = options;
  const reducerName = getReducerName( prefix ? `${prefix}/${name}` : name );

  if (action.type !== reducerName) return state;
  return typeof reducer === 'function' ? 
    reducer(state, action) : 
    asyncHandler(state, action, reducer, options);
}

const asyncHandler = (state, action, reducer, options) => {
  if (action.meta === undefined) {
    console.error('Don\'t use async handlers with the sync request!');
  }

  const { sequence = 'complete' } = action.meta || {};
  const handler = reducer[sequence];

  if (handler) {
    if (sequence !== 'error') {
      return handler(state, action);
    } else {
      const errorCode = action.payload.status || 'unknown_error';

      if (handler[errorCode]) {
        return handler[errorCode](state, action)
      }

      if (handler.default) {
        return handler.default(state, action)
        }
      }
    } else {
      if (sequence === 'error') {
        const errorCode = action.payload.status|| 'unknown_error';
        if (errorCode == 401) {
          return h401(state, action);
        }
      }
    }
  return state;
}

const signalResetReducer = handleAction('turnOffSignals', state => state.delete ? state.delete('_signals'): state );

export default function createAsyncStores(handlers, defaultState, options = {}) {  

  const reducers = Object.keys(handlers).map(type => handleAction(type, handlers[type], options));

  const reducer = (previous, current) => [
      ...reducers, 
      signalResetReducer
    ].reduce((p, r) => r(p, current), previous);  

  return typeof defaultState !== 'undefined'
    ? (state = defaultState, action) => reducer(state, action)
    : reducer;
}
