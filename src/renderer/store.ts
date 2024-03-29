import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './features/collection/collectionSlice';
import playerReducer from './features/player/playerSlice';

export const store = configureStore({
  reducer: {
    collection: collectionReducer,
    player: playerReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch