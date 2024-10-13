import { TracksTable } from '@renderer/components/TracksTable';
import classes from './HomeView.module.css';
import { VIEW_DETAIL_COMMAND } from '@preload/channels';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '@preload/emusik';

export function HomeView() {
  const navigate = useNavigate();

  useEffect(() => {
    window.Main.on(VIEW_DETAIL_COMMAND, (track: Track) => navigate(`detail/${track.id}`));
  }, []);
  return (
    <div className={classes.homeview_container}>
      <TracksTable />
    </div>
  );
}
