/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState } from 'react';
import { Track } from '../../electron/types/emusik';
import { AppContextType } from '../@types/emusik.d';
import AudioPlayer from '../lib/audioplayer';

const AppContext = React.createContext({} as AppContextType);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [tracksCollection, setTracksCollection] = useState<Track[]>([]);
  const [trackDetail, setTrackDetail] = useState<Track | null>(null);
  const player = new AudioPlayer();

  return (
    <AppContext.Provider
      value={{
        tracksCollection,
        setTracksCollection,
        trackDetail,
        setTrackDetail,
        player
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
