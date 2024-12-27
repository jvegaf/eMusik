import { FC, useEffect } from 'react';
import useLibraryStore from '@renderer/stores/useLibraryStore';
import { Track } from 'src/preload/emusik';
import { RouterProvider } from 'react-router-dom';
import { TRACK_UPDATED } from '../../preload/channels';
import './App.css';
import router from './views/router';

const App: FC = () => {
  const updateTrack = useLibraryStore(state => state.updateTrack);

  useEffect(() => {
    // window.Main.on(FIX_COMMAND, (selected: Track[]) => selected.forEach(t => window.Main.fixTrack(t)));
    window.Main.on(TRACK_UPDATED, (updated: Track) => updateTrack(updated));
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
