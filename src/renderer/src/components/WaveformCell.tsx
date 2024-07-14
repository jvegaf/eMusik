import { useWavesurfer } from '@wavesurfer/react';
import React, { useEffect } from 'react';

type WaveformCellProps = {
  url: string;
  wfRef: React.RefObject<HTMLDivElement>;
};
export const WaveformCell: React.FC<WaveformCellProps> = ({ url, wfRef }) => {
  const { wavesurfer } = useWavesurfer({
    container: wfRef,
    height: 30,
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
    url: url,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
  });

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.once('interaction', () => {
        wavesurfer.play();
      });
    }
  }, [wavesurfer]);

  return <div ref={wfRef} />;
};
