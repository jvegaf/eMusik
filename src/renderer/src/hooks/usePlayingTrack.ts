import { Track } from '../../../preload/types/harmony';
import usePlayerStore from '../stores/usePlayerStore';

export default function usePlayingTrack(): Track | null {
  return usePlayerStore(state => {
    return state.playingTrack;
  });
}
