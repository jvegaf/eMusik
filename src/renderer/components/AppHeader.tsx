import React from 'react';
import useAppState from 'renderer/hooks/useAppState';
import styled from 'styled-components';
import PauseButton from './PauseButton';
import PlayButton from './PlayButton';
import Player from './Player';
import { useAudioPlayer } from 'react-use-audio-player';
import { Button } from '@mantine/core';
import { useAppSelector } from 'renderer/hooks';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Styles = styled.div`
  background-color: #222222;
  border-bottom: 0;
  margin: 0;
  padding: 0;
  height: 70px;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: 1fr;
  row-gap: 0;

  .left-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .center-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right-container {
    margin-right: 30;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
`;

const AppHeader: React.FC = () => {
  const { togglePlayPause, playing } = useAudioPlayer();
  const { onFixAllTracks, onOpenFolder } = useAppState();
  const tracks = useAppSelector((state) => state.collection.tracks);
  const trackPlaying = useAppSelector((state) => state.player.trackPlaying);

  const btnProps = {
    color: '#EEEEEE',
    size: 40,
    action: togglePlayPause,
  };

  return (
    <Styles>
      <div className="left-container">{playing ? <PauseButton {...btnProps} /> : <PlayButton {...btnProps} />}</div>
      <div className="center-container">
        <Player trackPlaying={trackPlaying} />
      </div>
      <div className="right-container">
        {tracks && tracks.length && (
          <>
            <Button onClick={onOpenFolder} size="sm">
              Open Folder
            </Button>
            <Button onClick={onFixAllTracks} size="sm">
              Fix All tracks
            </Button>
          </>
        )}
      </div>
    </Styles>
  );
};

export default AppHeader;