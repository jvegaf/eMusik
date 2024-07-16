import { useWavesurfer } from '../hooks/useWavesurfer';
import { useEffect, useRef } from 'react';

// type WaveformCellProps = {
//   url: string;

// };

export const WaveformCell: React.FC = props => {
  const containerRef = useRef();
  const wavesurfer = useWavesurfer(containerRef, props);

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
