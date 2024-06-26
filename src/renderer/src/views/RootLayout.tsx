import AppBar from '../components/AppBar';
import { Outlet } from 'react-router-dom';
import classes from './RootLayout.module.css';
import { useViewportSize } from '@mantine/hooks';
import { useEffect } from 'react';
import useAppStore from '../stores/useAppStore';
import { StatusBar } from '@renderer/components/StatusBar';

export function RootLayout() {
  const { height } = useViewportSize();
  const updateHeight = useAppStore(state => state.updateHeight);

  useEffect(() => {
    updateHeight(height);
  }, [height]);

  return (
    <div className={classes.rlayout}>
      <div className={classes.topbar}>
        <AppBar />
      </div>
      <main className={classes.mainContainer}>
        <Outlet />
      </main>
      <div className={classes.footer}>
        <StatusBar />
      </div>
    </div>
  );
}
