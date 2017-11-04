# Cat Stores for Redux

Redux store without ugly reducers names, ugly case operators and other ugly stuff.

Use it with __redux-feline-actions__ to create simple and nice actions and reducers.


## Installation

__npm install -s cat-stores__

## Usage

```
import createAsyncStores from 'cat-stores';
import Immutable, { Map } from 'immutable';

const stores = createAsyncStores({ 
  enableSomeStuff: (state, action) => state.set('someStuffEnabled', true),    // Sync request for reducer ENABLE_SOME_STUFF

  disableSomeStuff: (state, action) => state.set('someStuffEnabled', false),  // Sync request for reducer DISABLE_SOME_STUFF

  getSomeData: {                                            // Async request, reducer GET_SOME_DATA
    begin: state => state                                   // Request was made
      .set('dataIsLoading', true),

    complete: (state, { payload: {data} }) => state         // Request completed successfully
      .set('dataIsLoading', false)
      .set('someData', Immutable.fromJS(data)),

    error: {                              // Error handler
      401: state => state                 // We can add own handler for every error code
        .set('dataIsLoading', false)
        .set('error', 'Unathorized'),

      404: state => state
        .set('dataIsLoading', false)
        .set('error', 'Not found'),

      default: state => state             // Or just use the generic error handler
        .set('dataIsLoading', false)
        .set('error', 'Some other error')
      }
    }
  }, Map({
    someData: Map(),
    dataIsLoading: false,
    error: '',
    someStuffEnabled: false
  })

```