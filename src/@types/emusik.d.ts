import { Dispatch, SetStateAction } from 'react';
import { Track } from '../../electron/types/emusik';
import AudioPlayer from '../lib/audioplayer';

export type AppContextType = {
  tracksCollection: Track[];
  setTracksCollection: Dispatch<SetStateAction<Track[]>>;
  trackDetail: Track | null;
  setTrackDetail: Dispatch<SetStateAction<Track | null>>;
  player: AudioPlayer;
};
