import { useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

export const useWavesurfer = (containerRef, options) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      height: 20,
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [options, containerRef]);

  return wavesurfer;
};
