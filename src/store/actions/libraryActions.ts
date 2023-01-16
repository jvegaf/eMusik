import { Track } from '../../../electron/types/emusik';
import { LibraryState } from '../reducers/libraryReducer';

export enum ActionType {
  SET_TRACKS = 'SET_TRACKS',
  FIX_TRACKS = 'FIX_TRACKS',
  UPDATE_TRACK = 'UPDATE_TRACK'
}

interface setTracks {
  type: ActionType.SET_TRACKS;
  payload: Track[];
}

interface fixTracks {
  type: ActionType.FIX_TRACKS;
  payload: Track[];
}

interface updateTrack {
  type: ActionType.UPDATE_TRACK;
  payload: Track;
}

export type LibraryAction = setTracks | fixTracks | updateTrack;
