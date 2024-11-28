import usePlayerStore from '../stores/usePlayerStore';
import classes from './PlayerControl.module.css';
import { PlayerStatus } from '@preload/emusik-player';
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from '@tabler/icons-react';
import { ActionIcon, rem, Space } from '@mantine/core';

export function PlayerControl() {
  const playerStatus = usePlayerStore(state => state.playerStatus);
  const togglePlayPause = usePlayerStore(state => state.api.togglePlayPause);

  return (
    <div className={classes.playerControls}>
      <ActionIcon
        variant='filled'
        radius='xl'
        color='rgba(23, 22, 22, 1)'
        size='xl'
        aria-label='Next'
        onClick={() => togglePlayPause()}
      >
        <IconPlayerSkipBackFilled
          style={{ width: rem(20), height: rem(20) }}
          stroke={1.5}
        />
      </ActionIcon>
      <Space w='lg' />
      <ActionIcon
        variant='filled'
        size={48}
        radius='xl'
        aria-label='Play'
        onClick={() => togglePlayPause()}
      >
        {playerStatus === PlayerStatus.PLAY ? (
          <IconPlayerPauseFilled
            style={{ width: rem(32), height: rem(32) }}
            stroke={1.5}
          />
        ) : (
          <IconPlayerPlayFilled
            style={{ width: rem(32), height: rem(32) }}
            stroke={1.5}
          />
        )}
      </ActionIcon>
      <Space w='lg' />
      <ActionIcon
        variant='filled'
        size='xl'
        radius='xl'
        color='rgba(23, 22, 22, 1)'
        aria-label='Next'
        onClick={() => togglePlayPause()}
      >
        <IconPlayerSkipForwardFilled
          style={{ width: rem(20), height: rem(20) }}
          stroke={1.5}
        />
      </ActionIcon>
    </div>
  );
}
