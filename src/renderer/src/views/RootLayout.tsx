import Player from '../components/Player';
import { Outlet } from 'react-router-dom';
import classes from './RootLayout.module.css';
import { useViewportSize } from '@mantine/hooks';
import { useEffect } from 'react';
import useAppStore from '../stores/useAppStore';
import TopBar from '@renderer/components/TopBar';

export function RootLayout() {
  const { height } = useViewportSize();
  const updateHeight = useAppStore(state => state.updateHeight);

  useEffect(() => {
    updateHeight(height);
  }, [height]);

  return (
    <div className={classes.rlayout}>
      <main className={classes.mainContainer}>
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
