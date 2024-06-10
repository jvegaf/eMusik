/**
 * App models
 */

export type TrackId = string;
export type TrackSrc = string;

export interface Artwork {
  mime: string;
  type: { id: number };
  description?: string;
  imageBuffer: Buffer;
}

export interface Track {
  id: TrackId;
  album?: string;
  artist?: string;
  bpm?: number;
  genre?: string;
  key?: string;
  duration?: number;
  time?: string;
  path: TrackSrc;
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

export interface Playlist {
  name: string;
  tracks: string[];
}

/**
 * Database schemes
 */
export type TrackModel = PouchDB.Core.ExistingDocument<Track & PouchDB.Core.AllDocsMeta>;

export type PlaylistModel = PouchDB.Core.ExistingDocument<Playlist & PouchDB.Core.AllDocsMeta>;

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
