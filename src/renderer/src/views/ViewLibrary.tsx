import Onboarding from '../components/Onboarding';
import TrackList from '../components/TrackList';
import { useViewportSize } from '../hooks/useViewPortSize';
import useLibraryStore from '../stores/useLibraryStore';
import classes from './ViewLibrary.module.css';

function ViewLibrary() {
  const tracks = useLibraryStore(state => state.tracks);
  const onOpen = useLibraryStore(state => state.onOpen);
  const onDrag = useLibraryStore(state => state.onDrag);
  const { height } = useViewportSize();

  if (!tracks.length) {
    return (
      <div className={classes.library}>
        <Onboarding
          openHandler={onOpen}
          dragHandler={onDrag}
        />
      </div>
    );
  }

  return (
    <div className={classes.library}>
      <TrackList
        data={tracks}
        height={height - 80}
      />
    </div>
  );
}

export default ViewLibrary;
