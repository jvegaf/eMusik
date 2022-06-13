/* eslint-disable react/jsx-props-no-spreading */
import { createStyles } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import OnBoarding from 'renderer/components/OnBoarding';
import useAppState from 'renderer/hooks/useAppState';
import { Track, TrackId } from 'shared/types/emusik';
import AppHeader from '../components/AppHeader';
import TrackDetail from '../components/TrackDetail';
import TrackList from '../components/TrackList';

const useStyles = createStyles(theme => ({
  main: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },
  header: {
    minHeight: 70,
  },
  content: {
    flexGrow: 1,
  },
}));

const MainView = () => {
  const { classes } = useStyles();
  const { height } = useViewportSize();
  const [tHeight, setTHheight] = useState(0);
  const { tracks, showCtxMenu, trackPlaying, setTrackPlaying, trackDetail, setTrackDetail, updateTrack, onFixTrack } =
    useAppState();
  const [content, setContent] = useState(<OnBoarding />);

  useEffect(() => {
    window.electron.ipcRenderer.on('view-detail-command', (trackId: TrackId) => setTrackDetail(trackId));

    window.electron.ipcRenderer.on('play-command', (trackId: TrackId) => setTrackPlaying(trackId));

    window.electron.ipcRenderer.on('fix-track-command', (trackId: TrackId) => onFixTrack(trackId));
  }, [onFixTrack, setTrackDetail, setTrackPlaying, tracks]);

  useEffect(() => {
    const newHeight = height - 100;
    setTHheight(newHeight);
  }, [height]);

  const detailProps = useMemo(() => {
    const track = tracks.find(t => t.id === trackDetail) as Track;

    return {
      track,
      closeDetail: () => setTrackDetail(undefined),
      saveChanges: updateTrack,
    };
  }, [setTrackDetail, trackDetail, tracks, updateTrack]);

  useEffect(() => {
    const tlprops = {
      tHeight,
      tracks,
      trackPlaying,
      setTrackPlaying,
      showCtxMenu,
    };
    if (tracks.length > 0) {
      setContent(<TrackList {...tlprops} />);
    }

    return () => setContent(<OnBoarding />);
  }, [setTrackPlaying, showCtxMenu, tHeight, trackPlaying, tracks]);

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <AppHeader />
      </div>
      <div className={classes.content}>{trackDetail ? <TrackDetail {...detailProps} /> : content}</div>
    </div>
  );
};

export default MainView;
