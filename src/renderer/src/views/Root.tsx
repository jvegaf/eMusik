import AppBar from '../components/AppBar';
import { Outlet } from 'react-router-dom';
import classes from './Root.module.css';

function RootView() {
  return (
    <div className={classes.root}>
      <main className={classes.main}>
        <Outlet />
      </main>
      <div className={classes.playerBar}>
        <AppBar />
      </div>
    </div>
  );
}

export default RootView;
