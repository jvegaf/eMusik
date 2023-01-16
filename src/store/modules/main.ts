import { createAction, handleActions } from 'redux-actions';
import { Track } from '../../../electron/types/emusik';

interface MainState {
  collection: Track[];
  trackDetail?: Track;
}

const initialState: MainState = {
  collection: [],
  trackDetail: undefined
};

const SET_COLLECTION = 'main/SET_COLLECTION';
const UPDATE_TRACK = 'main/UPDATE_TRACK';
const SET_TRACK_DETAIL = 'main/SET_TRACK_DETAIL';

export const setCollection = createAction(SET_COLLECTION);
export const setTrackDetail = createAction(SET_TRACK_DETAIL);
export const updateTrack = createAction(UPDATE_TRACK);

const updater = (col: Track[], track: Track) => {
  const updated = col.map((t) => (t.id === track.id ? track : t));
  return updated;
};

export default handleActions(
  {
    [SET_COLLECTION]: (state: MainState, action: any) => ({
      ...state,
      collection: action.payload
    }),
    [SET_TRACK_DETAIL]: (state: MainState, action: any) => ({
      ...state,
      trackDetail: action.payload
    }),
    [UPDATE_TRACK]: (state: MainState, action: any) => ({
      ...state,
      collection: updater(state.collection, action.payload)
    })
  },
  initialState
);
