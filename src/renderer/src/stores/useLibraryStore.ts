import { create } from 'zustand';
import log from 'electron-log/renderer';
import { Track, TrackId } from 'src/preload/emusik';
import { FileWithPath } from '@mantine/dropzone';
import useAppStore from './useAppStore';

type LibraryState = {
  tracks: Track[];
  sorted: Track[];
  isSorted: boolean;
  api: {
    sort: (tracks: Track[]) => void;
    add: (track: Track) => void;
    update: (track: Track) => void;
    onOpen: () => void;
    onDrag: (files: FileWithPath[]) => void;
    getTrackFromId: (id: TrackId) => Track | undefined;
    fix: (trackIds: TrackId[]) => void;
    updateTags: (track: Track) => void;
    remove: (trackIds: TrackId[]) => void;
  };
};

const useLibraryStore = create<LibraryState>(set => ({
  tracks: [],
  sorted: [],
  isSorted: false,
  api: {
    sort: sorted => set({ sorted, isSorted: true }),
    add: track => set(state => ({ tracks: [...state.tracks, track] })),
    update: track => {
      set(state => ({ tracks: state.tracks.map(t => (t.id === track.id ? track : t)) }));
      const updateMessage = useAppStore.getState().updateMessage;
      updateMessage(`Track updated:      ${track.artist} - ${track.title} `);
    },
    onOpen: async () => {
      const newTracks = await window.Main.openFolder();
      log.info('total tracks', newTracks.length);
      set({ tracks: newTracks });
    },
    onDrag: async files => {
      const newTracks = await window.Main.openFiles(files.map(f => f.path!));
      log.info('total tracks', newTracks.length);
      set({ tracks: newTracks });
    },
    getTrackFromId: id => {
      return useLibraryStore.getState().tracks.find(track => track.id === id);
    },
    fix: trackIds => {
      trackIds.forEach(id => {
        const track = useLibraryStore.getState().getTrackFromId(id);
        if (!track) return;
        window.Main.track.fix(track);
      });
    },

    updateTags: track => {
      window.Main.track.persist(track);

      set({ tracks: useLibraryStore.getState().tracks.map(t => (t.id === track.id ? track : t)) });
    },
    remove: trackIds => {
      trackIds.forEach(id => {
        const track = useLibraryStore.getState().getTrackFromId(id);
        if (!track) return;
        set(state => ({ tracks: state.tracks.filter(t => t.id !== id) }));
        window.Main.track.remove(track);
      });
    },
  },
}));

export default useLibraryStore;
