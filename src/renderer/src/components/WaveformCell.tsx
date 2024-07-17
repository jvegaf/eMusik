import { Track } from '@preload/emusik';
import { useWavesurfer } from '../hooks/useWavesurfer';
import { useEffect, useRef } from 'react';

type WaveformCellProps = {
  track: Track;
};

export const WaveformCell: React.FC<WaveformCellProps> = ({ track }) => {
  const containerRef = useRef();
  const wavesurfer = useWavesurfer(containerRef, track);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on('interaction', () => {
        wavesurfer.playPause();
      }),
    ];

    return () => {
      subscriptions.forEach(unsub => unsub());
    };
  }, [wavesurfer]);

  return (
    <div
      ref={containerRef}
      style={{ minWidth: '200px' }}
    />
  );
};
