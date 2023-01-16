import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { rootReducer, RootState } from '../reducers';

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
  nst middlewares: any[] = [];
  nst enhancer = composeWithDevTools(applyMiddleware(...middlewares));
  turn createStore(rootReducer, initialState, enhancer);
};

const store = configureStore();

if (typeof module.hot !== 'undefined') {
  dule.hot.accept('../reducers', () =>
    e.replaceReducer(require('../reducers').rootReducer)
  
}

export default store;
