import { FC, useEffect } from 'react';
import useLibraryStore from '@renderer/stores/useLibraryStore';
import { Track } from 'src/preload/emusik';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { RootLayout } from './views/RootLayout';
import { DetailView, HomeView, WelcomeView } from './views';
import { FIX_COMMAND, PLAY_COMMAND, TRACK_UPDATED, UPDATE_MSG } from '../../preload/channels';
import usePlayerStore from './stores/usePlayerStore';
import './App.css';

const App: FC = () => {
  const tracks = useLibraryStore(state => state.tracks);
  const updateTrack = useLibraryStore(state => state.updateTrack);
  const updateMessage = useLibraryStore(state => state.updateMessage);
  const fixTracks = useLibraryStore(state => state.fixTracks);
  const start = usePlayerStore(state => state.api.start);

  useEffect(() => {
    window.Main.on(FIX_COMMAND, (selected: Track[]) => fixTracks(selected));
    window.Main.on(TRACK_UPDATED, (updated: Track) => updateTrack(updated));
    window.Main.on(UPDATE_MSG, (msg: string) => updateMessage(msg));
    window.Main.on(PLAY_COMMAND, (track: Track) => start(track.id));
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
