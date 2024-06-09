-- CreateTable
CREATE TABLE "Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "filepath" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "albumartist" TEXT,
    "albumID" INTEGER NOT NULL,
    "album" TEXT NOT NULL,
    "year" INTEGER,
    "date" TEXT,
    "genre" TEXT,
    "bpm" INTEGER,
    "key" TEXT,
    "category" TEXT,
    "duration" INTEGER,
    "bitrate" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'track',
    CONSTRAINT "Track_artist_fkey" FOREIGN KEY ("artist") REFERENCES "Artist" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Track_albumartist_fkey" FOREIGN KEY ("albumartist") REFERENCES "Artist" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Track_albumID_album_fkey" FOREIGN KEY ("albumID", "album") REFERENCES "Album" ("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "cover" TEXT,
    "type" TEXT NOT NULL DEFAULT 'album',
    CONSTRAINT "Album_artist_fkey" FOREIGN KEY ("artist") REFERENCES "Artist" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artist" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'artist'
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'playlist'
);

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "trackID" INTEGER NOT NULL,
    "playlistID" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'playlistItem',
    CONSTRAINT "PlaylistItem_trackID_fkey" FOREIGN KEY ("trackID") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_playlistID_fkey" FOREIGN KEY ("playlistID") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_filepath_key" ON "Track"("filepath");

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_artist_key" ON "Album"("name", "artist");

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_id_key" ON "Album"("name", "id");
