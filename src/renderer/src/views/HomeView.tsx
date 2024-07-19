import { TracksTable } from '@renderer/components/TracksTable';
import classes from './HomeView.module.css';

export function HomeView() {
  return (
    <div className={classes.homeview_container}>
      <TracksTable />
    </div>
  );
}
