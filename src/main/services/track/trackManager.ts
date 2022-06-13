/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import * as Path from 'path';
import * as mm from 'music-metadata';
import { v4 as uuid } from 'uuid';
import { Sanitize, ParseDuration } from '../../../shared/utils';
import { Artwork, Track } from '../../../shared/types/emusik';
import LoadTagsFromFile, { FileTags } from '../tag/mmLoader';

const getFilename = (filepath: string) => {
  return Path.basename(filepath, '.mp3');
};

const sanitizeFilename = (filename: string) => {
  return Sanitize(filename).replaceAll('-', ' ').split('_').join(' ').trim();
};

const GetTrackTitle = (title: string | undefined, filepath: string) => {
  if (title && title.length) {
    return title;
  }
  const filename = getFilename(filepath);
  return sanitizeFilename(filename);
};

const GetArtwork = (tags: FileTags): Artwork | undefined => {
  const { picture } = tags;

  const cover = mm.selectCover(picture);

  if (cover) {
    return {
      mime: cover.format,
      type: { id: 3, name: 'front cover' },
      description: cover.description,
      data: cover.data,
    } as Artwork;
  }
  return undefined;
};

const CreateTrack = async (file: string): Promise<Track | null> => {
  const tags = await LoadTagsFromFile(file);
  if (!tags) {
    return null;
  }

  const track: Track = {
    id: uuid(),
    album: tags.album,
    artist: tags.artist,
    bpm: tags.bpm,
    genre: tags.genre?.join(', '),
    key: tags.key,
    duration: tags.duration,
    time: ParseDuration(tags.duration),
    filepath: file,
    title: GetTrackTitle(tags.title, file),
    year: tags.year,
    artwork: GetArtwork(tags),
    bitrate: tags.bitrate / 1000,
  };
  return track;
};

export const GetTracks = async (files: string[]) => {
  const tracks: Track[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const track = await CreateTrack(file);
    if (track !== null) {
      tracks.push(track);
    }
  }

  return tracks;
};
