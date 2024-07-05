import { useEffect, useState } from 'react';
import classes from './Player.module.css';
import { PlayerControl } from './PlayerControl';
import PlayerDisplay from './PlayerDisplay';
import usePlayerStore from '@renderer/stores/usePlayerStore';
import { Track } from '@preload/emusik';
import useAppStore from '@renderer/stores/useAppStore';
import useLibraryStore from '@renderer/stores/useLibraryStore';
import { externalizeDepsPlugin } from 'electron-vite';

export default function Player() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [artSrc, setArtSrc] = useState<string | null>(null);
  const playingTrack = usePlayerStore(state => state.playingTrack);
  const getArtImage = useAppStore(state => state.getArtImage);
  const getTrackFromId = useLibraryStore(state => state.getTrackFromId);

  const setArtwork = async (track: Track) => {
    const artImage = await getArtImage(track);
    if (artImage === null) {
      setArtSrc(null);
      return;
    }
    const blob = new Blob([artImage.imageBuffer], { type: artImage.mime });

    const src = URL.createObjectURL(blob);
    setArtSrc(src);
  };

  useEffect(() => {
    if (playingTrack.length) {
      const track = getTrackFromId(playingTrack);
      if (!track) return;
      setTitle(track.title);
      setArtist(track.artist ?? '');
      setArtwork(track);
    }
  }, [playingTrack]);

  return (
    <header className={classes.header}>
      <PlayerDisplay
        title={title}
        artist={artist}
        artSrc={artSrc}
      />
      <PlayerControl />
      <div></div>
    </header>
  );
}
