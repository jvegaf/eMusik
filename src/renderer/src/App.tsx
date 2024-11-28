import { FC, useEffect } from 'react';
import useLibraryStore from '@renderer/stores/useLibraryStore';
import { Track } from 'src/preload/emusik';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { RootLayout } from './views/RootLayout';
import { DetailView, HomeView, WelcomeView } from './views';
import { ADD_ALL, FIX_COMMAND, PLAY_COMMAND, TRACK_UPDATED } from '../../preload/channels';
import usePlayerStore, { usePlayerAPI } from './stores/usePlayerStore';
import './App.css';

const App: FC = () => {
  const tracks = useLibraryStore.use.tracks();
  const updateTrack = useLibraryStore.use.updateTrack();
  const fixTracks = useLibraryStore.use.fixTracks();
  const addAll = useLibraryStore.use.addAll();
  const start = usePlayerAPI().start;

  useEffect(() => {
    window.Main.ready();
    window.Main.on(FIX_COMMAND, (selected: Track[]) => fixTracks(selected));
    window.Main.on(TRACK_UPDATED, (updated: Track) => updateTrack(updated));
    window.Main.on(PLAY_COMMAND, (track: Track) => start(track.id));
    window.Main.on(ADD_ALL, (tracks: Track[]) => addAll(tracks));
  }, []);

  const router = createHashRouter([
    {
      path: '/',
      Component: RootLayout,
      children: [
        {
          index: true,
          Component: tracks.length ? HomeView : WelcomeView,
        },
        {
          path: 'detail/:trackId',
          Component: DetailView,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
