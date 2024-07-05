import Onboarding from '../components/Onboarding';
import classes from './WelcomeView.module.css';
import useLibraryStore from '../stores/useLibraryStore';
import useAppStore from '@renderer/stores/useAppStore';

export function WelcomeView() {
  const onOpen = useLibraryStore(state => state.onOpen);
  const onDrag = useLibraryStore(state => state.onDrag);
  const contentHeight = useAppStore(state => state.contentHeight);

  return (
    <div
      className={classes.welcomeRoot}
      style={{ height: `${contentHeight}px` }}
    >
      <Onboarding
        openHandler={onOpen}
        dragHandler={onDrag}
      />
    </div>
  );
}
