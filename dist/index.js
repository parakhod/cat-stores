'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAsyncStores;

var _reduxFelineActions = require('redux-feline-actions');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var h401 = function h401(state) {
  return state.setIn(['_signals', 'authError'], true);
};

var handleAction = function handleAction(name, reducer) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return function (state, action) {
    var prefix = options.prefix;

    var reducerName = (0, _reduxFelineActions.getReducerName)(prefix ? prefix + '/' + name : name);

    if (action.type !== reducerName) return state;
    return typeof reducer === 'function' ? reducer(state, action) : asyncHandler(state, action, reducer, options);
  };
};

var asyncHandler = function asyncHandler(state, action, reducer, options) {
  if (action.meta === undefined) {
    console.error('Don\'t use async handlers with the sync request!');
  }

  var _ref = action.meta || {},
      _ref$sequence = _ref.sequence,
      sequence = _ref$sequence === undefined ? 'complete' : _ref$sequence;

  var handler = reducer[sequence];

  if (handler) {
    if (sequence !== 'error') {
      return handler(state, action);
    } else {
      var errorCode = action.payload.status || 'unknown_error';

      if (handler[errorCode]) {
        return handler[errorCode](state, action);
      }

      if (handler.default) {
        return handler.default(state, action);
      }
    }
  } else {
    if (sequence === 'error') {
      var _errorCode = action.payload.status || 'unknown_error';
      if (_errorCode == 401) {
        return h401(state, action);
      }
    }
  }
  return state;
};

var signalResetReducer = handleAction('turnOffSignals', function (state) {
  return state.delete ? state.delete('_signals') : state;
});

function createAsyncStores(handlers, defaultState) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  var reducers = Object.keys(handlers).map(function (type) {
    return handleAction(type, handlers[type], options);
  });

  var reducer = function reducer(previous, current) {
    return [].concat(_toConsumableArray(reducers), [signalResetReducer]).reduce(function (p, r) {
      return r(p, current);
    }, previous);
  };

  return typeof defaultState !== 'undefined' ? function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
    var action = arguments[1];
    return reducer(state, action);
  } : reducer;
}