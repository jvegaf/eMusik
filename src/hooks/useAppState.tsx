/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useContext } from 'react';
import { Track } from '../../electron/types/emusik';
import AppContext from '../context/AppContext';
import logger from '../../electron/services/logger';

export default function useAppState() {
  const { tracksCollection, setTracksCollection, trackDetail, setTrackDetail, player } = useContext(AppContext);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const onOpenFolder = React.useCallback(async () => {
    const newTracks = await window.Main.OpenFolder();

    if (!newTracks) return;
    logger.info('new tracks:', newTracks.length);

    setTracksCollection(newTracks);
  }, [setTracksCollection]);

  const closeDetail = React.useCallback(() => {
    setTrackDetail(undefined);
  }, [setTrackDetail]);

  const saveChanges = React.useCallback(
    (track: Track) => {
      logger.info('track update', track);

      window.Main.PersistTrack(track);
      const filtered = tracksCollection.filter((t) => t.id !== track.id);
      const allTracks = [...filtered, track];
      setTracksCollection(allTracks);
      if (trackDetail === track) {
        closeDetail();
      }
    },
    [tracksCollection, setTracksCollection, trackDetail, closeDetail]
  );

  const tracksFixedHandler = React.useCallback(
    (fixedTracks: Track[]) => {
      logger.info('total fixed tracks: ', fixedTracks.length);
      logger.info('collection size: ', tracksCollection.length);
      logger.info('filtered tracks: ', filtered.length);
      const allTracks = tracksCollection.map((t) => {
        if (fixedTracks.includes((f) => f.id === t.id)) {
          return f;
        }
        return t;
      });
      logger.info('allTracks: ', allTracks.length);
      setTracksCollection(allTracks);
    },
    [tracksCollection, setTracksCollection]
  );

  const showCtxMenu = React.useCallback(
    (selected: Track[]) => {
      logger.info('selected in hook:', selected);
      window.Main.ShowContextMenu(selected);
    },
    [window]
  );

  const onFixAllTracks = React.useCallback(() => window.Main.FixTracks(TracksCollection), [tracksCollection]);

  const playTrack = React.useCallback(
    (t: Track) => {
      logger.info('track to play:', t);
      player.setTrack(t);
      player.play();
      setIsPlaying(true);
    },
    [player]
  );

  const togglePlayPause = React.useCallback(() => {
    if (player.isPaused()) {
      player.play();
      setIsPlaying(true);
    }
    player.pause();
    setIsPlaying(false);
  }, [player]);

  return {
    tracksCollection,
    setTracksCollection, // TODO: FIXME
    tracksFixedHandler,
    player,
    isPlaying,
    playTrack,
    togglePlayPause,
    trackDetail,
    setTrackDetail,
    onFixAllTracks,
    saveChanges,
    closeDetail,
    onOpenFolder,
    showCtxMenu
  };
}
