import { useCallback, useEffect, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';

import styles from './TrackProgress.module.css';
import { usePlayerAPI } from '../stores/usePlayerStore';
import usePlayingTrackCurrentTime from '../hooks/usePlayingTrackCurrentTime';
import { Track } from '@preload/emusik';
import { ParseDuration } from '@preload/utils';

type Props = {
  trackPlaying: Track | null;
};

export default function TrackProgress(props: Props) {
  const { trackPlaying } = props;

  const elapsed = usePlayingTrackCurrentTime();
  const playerAPI = usePlayerAPI();

  const jumpAudioTo = useCallback(
    (values: number[]) => {
      const [to] = values;

      playerAPI.jumpTo(to);
    },
    [playerAPI],
  );

  useEffect(() => {
    if (trackPlaying === null || !trackPlaying) return;
    const remain = Math.round(trackPlaying.duration! - elapsed);
    if (remain < 1) playerAPI.playNext();
  }, [elapsed, trackPlaying]);

  const [tooltipTargetTime, setTooltipTargetTime] = useState<null | number>(null);
  const [tooltipX, setTooltipX] = useState<null | number>(null);

  const showTooltip = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { offsetX } = e.nativeEvent;
      const barWidth = e.currentTarget.offsetWidth;

      const percent = (offsetX / barWidth) * 100;

      const time = trackPlaying !== null ? (percent * trackPlaying.duration!) / 100 : 0;

      setTooltipTargetTime(time);
      setTooltipX(percent);
    },
    [trackPlaying],
  );

  const hideTooltip = useCallback(() => {
    setTooltipTargetTime(null);
    setTooltipX(null);
  }, []);

  return (
    <div className={styles.trackSlider}>
      <Slider.Root
        min={0}
        max={trackPlaying?.duration}
        step={1}
        value={[elapsed]}
        onValueChange={jumpAudioTo}
        className={styles.trackRoot}
        onMouseMove={showTooltip}
        onMouseLeave={hideTooltip}
      >
        <Slider.Track className={styles.trackProgress}>
          <Slider.Range className={styles.trackRange} />
          {tooltipX !== null && (
            <div
              className={styles.progressTooltip}
              style={{ left: `${tooltipX}%` }}
            >
              {ParseDuration(tooltipTargetTime)}
            </div>
          )}
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Root>
    </div>
  );
}
