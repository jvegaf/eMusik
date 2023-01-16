import { combineReducers } from 'redux';

import { LibraryState, libraryReducer } from './libraryReducer';

export interface RootState {
  library: LibraryState;
}

export const rootReducer = combineReducers<RootState | undefined>({
  library: libraryReducer
});
