import { useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import useLibraryStore from '@renderer/stores/useLibraryStore';

export const useWavesurfer = (containerRef, track) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const updateTrack = useLibraryStore(state => state.updateTrack);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current) return;

    if (!track.peaks) {
      const ws = WaveSurfer.create({
        url: `file://${track.path}`,
        container: containerRef.current,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        height: 20,
      });

      console.log('generando peaks', track.path);

      ws.on('ready', () => {
        track.peaks = ws.exportPeaks({ channels: 1 });
        track.duration = ws.getDuration();
        updateTrack(track);
      });

      setWavesurfer(ws);
      return;
    }

    console.log('cargando peaks', track.path);

    const ws = WaveSurfer.create({
      url: `file://${track.path}`,
      container: containerRef.current,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      height: 20,
      peaks: track.peaks,
      duration: track.duration,
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [track, containerRef]);

  return wavesurfer;
};
