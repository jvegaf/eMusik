import type { app } from 'electron';

export type TrackId = number;
export type TrackSrc = string;

export interface Artwork {
  mime: string;
  type: { id: number };
  description?: string;
  imageBuffer: Buffer;
}

export interface Track {
  id?: TrackId;
  album?: string;
  artist?: string;
  bpm?: number;
  genre?: string;
  key?: string;
  duration?: number;
  time?: string;
  filepath: TrackSrc;
  title: string;
  year?: number;
  bitrate?: number;
}

export interface ResultTag {
  id: string;
  album?: string;
  artist?: string;
  bpm?: number;
  genre?: string;
  key?: string;
  duration: number;
  title: string;
  year?: string;
  artworkUrl?: string;
  tokens: string[];
}

export type Playlist = {
  id: number;
  /**
   * The name of the playlist. Does not need to be unique
   */
  name: string;
  /**
   * The description of the playlist, which gets displayed under its name
   */
  description: string | null;
  /**
   * ###DO NOT SET THIS. This is is used to provide a discriminating union for typescript.
   */
  type: string;
};

/**
 * Model PlaylistItem
 * A playlist contains tracks, but it can contain multiple of the same and needs to know their position inside the playlist. Thus we have another type for the playlist items.
 */
export type PlaylistItem = {
  id: number;
  index: number;
  trackID: number;
  playlistID: number;
  /**
   * ###DO NOT SET THIS. This is is used to provide a discriminating union for typescript.
   */
  type: string;
};

export interface MatchResult {
  tag: ResultTag;
  trackTokens: string[];
  matches: number;
  of: number;
}

export interface ArtTrack {
  reqTrack: Track;
  selectedArtUrl?: string;
}

export interface ArtsTrackDTO extends ArtTrack {
  artsUrls: string[];
}

export const enum LogCategory {
  Info,
  Warn,
  Debug,
  Error,
  Verbose,
}

export type IElectronPaths = Parameters<typeof app.getPath>[0];
export type DirectoryPath = t.TypeOf<typeof directoryPath>;

export type FilePath = t.TypeOf<typeof filePath>;
