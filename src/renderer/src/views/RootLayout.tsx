import Player from '../components/Player';
import { Outlet, useNavigate } from 'react-router-dom';
import classes from './RootLayout.module.css';
import { useViewportSize } from '@mantine/hooks';
import { useEffect } from 'react';
import useAppStore from '../stores/useAppStore';
import Sidebar from '@renderer/components/Sidebar';
import TopBar from '@renderer/components/TopBar';
import { Track } from '@preload/emusik';
import { VIEW_DETAIL_COMMAND } from '@preload/channels';

export function RootLayout() {
  const { height } = useViewportSize();
  const updateHeight = useAppStore(state => state.updateHeight);
  const navigate = useNavigate();

  useEffect(() => {
    window.Main.on(VIEW_DETAIL_COMMAND, (track: Track) => navigate(`detail/${track.id}`));
  }, []);

  useEffect(() => {
    updateHeight(height);
  }, [height]);

  return (
    <div className={classes.rlayout}>
      <main className={classes.mainContainer}>
        <Sidebar />
        <div className={classes.mainContent}>
          <TopBar />
          <Outlet />
        </div>
      </main>
      <div className={classes.player}>
        <Player />
      </div>
    </div>
  );
}
