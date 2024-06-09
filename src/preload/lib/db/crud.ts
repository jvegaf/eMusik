import { Playlist, Track } from '@preload/emusik';
import { prisma } from '../../Prisma';
import log from 'electron-log/main';

// TODO Update changed covers correctly (now they are getting deleted for whatever reason when they change)

export async function getPlaylists(): Promise<Playlist[]> {
  return prisma.playlist.findMany();
}

/**
 * Not used in the front-end. Just used internally by the back-end.
 */
async function getTracksFromPlaylists(): Promise<Track[]> {
  const prismaOptions = {
    include: {
      items: { include: { track: true } },
    },
  };

  return prisma.playlist
    .findMany(prismaOptions)
    .then(playlists => playlists as PlaylistWithItems[])
    .then(Array.map(({ items }) => items.map(({ track }) => track)))
    .then(RA.flatten)
    .then(tracks => E.right(tracks as readonly ITrack[]))
    .catch(createError('Failed to get playlists from database'));
}

export async function getPlaylist(
  _: IBackMessagesHandler | undefined,
  { where, isShuffleOn }: IPlaylistGetArgument,
): Promise<Either<IError, IPlaylistWithTracks>> {
  const usedSort = isShuffleOn ? 'RANDOM' : 'manualOrderIndex';

  return (
    prisma.playlist
      .findUniqueOrThrow({
        where: {
          id: where.id,
        },
        include: { thumbnailCovers: true, items: { include: { track: true } } },
      })
      .then(playlist => playlist as unknown as IPlaylistWithItems)
      // Convert the item[] to ( ITrack & {playlistIndex: number} )[]
      .then(convertItemsPlaylistToTracksPlaylist)
      .then(playlist => updateKeyValue('tracks', tracks => sortByKey(usedSort, tracks), playlist))
      .then(removeNulledKeys)
      .then(playlist => E.right(playlist as IPlaylistWithTracks))
      .catch(createError('Failed to get playlist from database'))
  );
}

/**
 * Used internally and not exposed to the front-end.
 * This gets the playlist with its database items, which are not tracks, but wrapper of tracks and their index within the playlist.
 */
async function getPlaylistWithItems(
  _: IBackMessagesHandler | undefined,
  id: IPlaylistID,
): Promise<Either<IError, IPlaylistWithItems>> {
  return prisma.playlist
    .findUniqueOrThrow({
      where: {
        id,
      },
      include: { items: { include: { track: true } } },
    })
    .then(playlist => playlist as unknown as IPlaylistWithItems)
    .then(removeNulledKeys)
    .then(playlist => E.right(playlist as IPlaylistWithItems))
    .catch(createError('Failed to get playlist from database'));
}

export async function createPlaylist(
  emitter: IBackMessagesHandler,
  options?: IPlaylistCreateArgument,
): Promise<Either<IError, IPlaylist>> {
  const playlistData: Either<IError, Prisma.PlaylistCreateArgs['data']> = await match(options)
    .with(P.nullish, async () => {
      const usedNames = await getPlaylistNames();

      if (E.isLeft(usedNames)) return usedNames;

      return E.right({ name: createDefaultPlaylistName(usedNames.right) });
    })
    .with(P.instanceOf(Object), async toAdd => {
      const tracksToAdd = await getTracksFromMusic(undefined, toAdd);

      if (E.isLeft(tracksToAdd)) return tracksToAdd;

      const itemsToCreate = tracksToAdd.right.map(({ id }, index) => ({
        trackID: id,
        index,
      }));

      const covers: Prisma.CoverWhereUniqueInput[] = tracksToAdd.right
        .map(({ cover }) => cover)
        .filter(isDefined)
        .filter(removeDuplicates)
        .slice(0, 4)
        .map(filepath => ({ filepath }));

      const data: Prisma.PlaylistCreateArgs['data'] = {
        name: toAdd.name,
        items: { create: itemsToCreate },
        ...(covers.length > 0 && { thumbnailCovers: { connect: covers } }),
      };

      return E.right(data);
    })
    .exhaustive();

  if (E.isLeft(playlistData)) {
    emitter.showAlert({ label: 'Failed to create playlist' });
    console.error(playlistData);
    return playlistData;
  }

  return prisma.playlist
    .create({
      data: playlistData.right,
    })
    .then(newPlaylist => {
      emitter.emit({
        event: 'playlistsUpdated',
        data: undefined,
        shouldForwardToRenderer: true,
      });

      // If the playlist was created by a context menu action on a music item, which would mean the user was not automatically forwarded to the playlist, create a succes notification.
      // Currently options are not set through context menu creation
      if (options) {
        // TODO on click on the notification forward to the playlist
        emitter.showNotification({
          label: `Created playlists ${options.name}.`,
        });
      }

      return pipe(newPlaylist, removeNulledKeys, playlist => E.right(playlist as IPlaylist));
    })
    .catch(error => {
      emitter.showAlert({ label: 'Failed to create playlist' });
      console.error(error);

      return createError('Failed to create playlist at database')(error);
    });
}

/**
 * Set the playlist image. Currently only supports setting one image or removing it.
 * @returns The filepath of the image file
 */
export async function updatePlaylistImage(
  emitter: IBackMessagesHandler,
  options: IPlaylistUpdateCoverArgumentConsume,
): Promise<Either<IError, IPlaylistID>> {
  // If a filepath to an image is provided, save it, otherwise the image should be removed from the playlist
  // Deleting it here is not nessarcy, as it will be deleted with the cleanUp after a sync process
  const result = await match(options)
    .with({ filepath: undefined, id: P.select() }, removePlaylistCover)
    .with({ filepath: P.string }, setPlaylistCover)
    .exhaustive();

  // Do not notificy the renderer to update the playlist, just return the error
  if (E.isLeft(result)) return result;

  // Notifify the renderer to update the playlist and return the playlist id
  emitter.emit({
    event: 'playlistUpdatedInternal',
    data: options.id,
    shouldForwardToRenderer: false,
  });

  emitter.emit({
    event: 'playlistsUpdated',
    data: undefined,
    shouldForwardToRenderer: true,
  });
  return E.right(options.id);
}

async function setPlaylistCover({
  coversDirectory,
  filepath,
  id,
}: IPlaylistSetCoverArgument): Promise<Either<IError, FilePath>> {
  const imageData = await readOutImage(filepath);

  if (E.isLeft(imageData)) return imageData;

  const { md5, path: imagePath, buffer } = imageData.right;
  const imageExtension = getExtension(imagePath);

  if (imageExtension === undefined)
    return createError('Image name is missing an extension')(`Provided filepath: ${filepath} - lacks an extension.`);

  const pathToSaveTo = createCoverPath(coversDirectory, md5, imageExtension);

  // If the cover is already saved to the disk, then skip saving it again
  if (E.isLeft(await checkPathAccessible(pathToSaveTo))) {
    const pictureOperation = await writeFileToDisc(buffer, pathToSaveTo);

    if (E.isLeft(pictureOperation)) return pictureOperation;
  }

  return prisma
    .$transaction([
      prisma.playlist.update({
        where: { id },
        data: { thumbnailCovers: { set: [] } },
      }),
      prisma.playlist.update({
        where: { id },
        data: {
          thumbnailCovers: {
            connectOrCreate: {
              where: { filepath: pathToSaveTo },
              create: { filepath: pathToSaveTo, md5, isManuallyAdded: true },
            },
          },
        },
      }),
    ])
    .then(() => E.right(filepath))
    .catch(createError('Failed to set playlist image'));
}

async function removePlaylistCover(id: IPlaylistID): Promise<Either<IError, IPlaylistID>> {
  return prisma.playlist
    .update({ where: { id }, data: { thumbnailCovers: { set: [] } } })
    .then(() => E.right(id))
    .catch(createError('Failed to remove cover from playlist'));
}

/**
 * After the contents of a playlist change, the thumbnail with the multiple covers needs to be updated.
 * This is different from {@link updatePlaylistImage}, which is a query handler, but this handles an internal event.
 */
export async function updatePlaylistCoverAfterTracksUpdate(
  messageHandler: IBackMessagesHandler,
  { data: playlistID }: IBackEndMessages['playlistUpdatedInternal'],
): Promise<void> {
  const playlist = await getPlaylist(undefined, {
    where: { id: playlistID },
  });

  if (E.isLeft(playlist)) {
    console.error(`Failed retrieving playlist afer update: ID: ${playlistID}`);
    return;
  }

  // Cover was added manually and does not need to be updated from the tracks
  if (playlist.right.thumbnailCovers?.at(0)?.isManuallyAdded) return;

  const oldThumbnail = playlist.right.thumbnailCovers?.map(({ filepath }) => filepath);
  const newThumbnails = getPlaylistCoverOfTracks(playlist.right.tracks);

  // Covers are the same, no need to update
  if (dequal(oldThumbnail, newThumbnails)) return;

  // Covers are different, update

  const thumbnailCovers = getCoverUpdateDataPlaylist(oldThumbnail, newThumbnails);

  prisma.playlist
    .update({
      where: { id: playlistID },
      data: { thumbnailCovers },
    })
    .then(({ id }) => {
      messageHandler.emit({
        event: 'playlistUpdated',
        data: id as IPlaylistID,
        shouldForwardToRenderer: true,
      });

      // The cover changed and this also needs to be reflected in the "All playlists" view
      messageHandler.emit({
        event: 'playlistsUpdated',
        data: undefined,
        shouldForwardToRenderer: true,
      });
    })
    .catch(console.error);
}

export async function renamePlaylist(
  emitter: IBackMessagesHandler,
  { id, name }: IPlaylistRenameArgument,
): Promise<Either<IError, string>> {
  return prisma.playlist
    .update({
      where: { id },
      data: { name },
    })
    .then(() => {
      emitter.emit({
        event: 'playlistsUpdated',
        shouldForwardToRenderer: true,
        data: undefined,
      });
      emitter.emit({
        event: 'playlistUpdatedInternal',
        shouldForwardToRenderer: false,
        data: id,
      });

      return E.right(name);
    })
    .catch(createError('Failed to rename playlist at database'));
}

export async function editPlaylistDescription(
  emitter: IBackMessagesHandler,
  { id, description }: IPlaylistEditDescriptionArgument,
): Promise<Either<IError, string | undefined>> {
  return prisma.playlist
    .update({
      where: { id },
      data: { description },
    })
    .then(() => {
      emitter.emit({
        event: 'playlistUpdatedInternal',
        shouldForwardToRenderer: false,
        data: id,
      });

      return E.right(description);
    })
    .catch(createError('Failed to edit playlist description'));
}

export async function deletePlaylist(emitter: IBackMessagesHandler, id: number): Promise<Either<IError, number>> {
  try {
    const deletedPlaylist = await prisma.playlist.delete({ where: { id } });

    emitter.emit({
      event: 'playlistsUpdated',
      data: undefined,
      shouldForwardToRenderer: true,
    });

    emitter.showNotification({
      label: `Deleted playlist ${deletedPlaylist.name}`,
      type: 'check',
    });

    return E.right(id);
  } catch (error) {
    emitter.showAlert({ label: `Failed to delete playlist.` });

    return createError('Failed to delete playlist at database')(error);
  }
}

/**
 * Add tracks to a playlist. Does not return an updated playlist, instead it messages the renderer that the playlist has changed.
 *
 * The renderer then refreshes the plalyist. And as this does nopt return anything, it is treated as an event and not as a query.
 */
export async function addTracksToPlaylist(
  toMainEmitter: IBackMessagesHandler,
  { musicToAdd, playlist, insertAt }: IAddTracksToPlaylistArgument,
): Promise<void> {
  const trackIDs = pipe(await getTracksFromMusic(undefined, musicToAdd), E.map(RA.map(({ id }) => id)));

  if (E.isLeft(trackIDs)) {
    console.error(trackIDs.left);

    toMainEmitter.emit({
      event: 'createNotification',
      data: {
        label: 'Failed to update playlist. Could not get tracks from database.',
        type: 'danger',
      },
      shouldForwardToRenderer: true,
    });
    return;
  }

  const resultEither = await match(insertAt)
    .with(P.nullish, () => appendTracksToPlaylist(playlist)(trackIDs.right))
    .with(P.number, insertIndex => insertTracksIntoPlaylist(playlist, insertIndex)(trackIDs.right))
    .exhaustive();

  E.foldW(
    error => {
      console.error(error);
      toMainEmitter.emit({
        event: 'createNotification',
        data: {
          label: 'Failed to update playlist',
          type: 'danger',
        },
        shouldForwardToRenderer: true,
      });
    },
    _success => {
      toMainEmitter.showNotification({
        // TODO make the notification nice and meaningful
        label: `Added ${musicToAdd.type} to playlist ${playlist.name}`,
        type: 'check',
      });

      toMainEmitter.emit({
        event: 'playlistUpdatedInternal',
        data: playlist.id,
        shouldForwardToRenderer: false,
      });
    },
  )(resultEither);
}

export async function removeTracksFromPlaylist(
  mainEmitter: IBackMessagesHandler,
  { id, trackIDs }: IRemoveTracksFromPlaylistArgument,
): Promise<void> {
  prisma.playlist
    .update({
      where: { id },
      data: {
        items: {
          deleteMany: trackIDs.map(trackID => ({ trackID: trackID })),
        },
      },
      include: { thumbnailCovers: true, items: { include: { track: true } } },
    })
    .then(playlist => playlist as unknown as IPlaylistWithItems)
    .then(playlist => {
      mainEmitter.emit({
        event: 'playlistUpdatedInternal',
        data: playlist.id,
        shouldForwardToRenderer: false,
      });
    })
    .catch(error => {
      console.error(error);
      mainEmitter.showAlert({
        label: 'Failed to delete track' + (trackIDs.length > 1 ? 's' : ''),
      });
    });
}

export async function getArtists(
  _?: IBackMessagesHandler,
  options?: IArtistFindManyArgument,
): Promise<Either<IError, readonly IArtist[]>> {
  const prismaOptions: Prisma.ArtistFindManyArgs = {
    where: options?.where,
    include: {
      albums: {
        include: {
          coverEntry: true,
        },
      },
      tracks: true,
    },
  };

  const usedSort = options?.isShuffleOn ? 'RANDOM' : 'name';

  const response = prisma.artist.findMany(prismaOptions) as Promise<IArtist[]>;

  return response
    .then(RA.map(removeNulledKeys))
    .then(RA.map(addArtistImage))
    .then(artists => sortByKey(usedSort, artists))
    .then(artists => E.right(artists as readonly IArtist[]))
    .catch(createError('Failed to get artists from database'));
}

/**
 * The handler emitter is injected by the backend at `index.ts`. If we need to call this function not from the, passing undefined as the emitter is fine.
 */
export async function getArtist(
  _: IBackMessagesHandler | undefined,
  { where, isShuffleOn }: IArtistGetArgument,
): Promise<Either<IError, IArtist>> {
  const include: Prisma.ArtistInclude = {
    albums: {
      include: {
        coverEntry: true,
      },
      orderBy: { name: 'asc' },
    },
    tracks: true,
  } as const;

  const usedSort = isShuffleOn ? 'RANDOM' : 'album';

  const rawArtist = prisma.artist.findUniqueOrThrow({
    where,
    include,
  }) as unknown as Promise<IArtist>;

  return rawArtist
    .then(artist => updateKeyValue('tracks', sortTracks(usedSort), artist))
    .then(removeNulledKeys)
    .then(addArtistImage)
    .then(artist => E.right(artist as IArtist))
    .catch(createError('Failed to get tracks from database'));
}

export async function getAlbums(
  _?: IBackMessagesHandler,
  options?: IAlbumFindManyArgument,
): Promise<Either<IError, readonly IAlbum[]>> {
  const prismaOptions: Prisma.AlbumFindManyArgs = {
    where: options?.where,
    include: { tracks: true },
  };

  const usedSort = options?.isShuffleOn ? 'RANDOM' : 'name';

  return prisma.album
    .findMany(prismaOptions)
    .then(RA.map(removeNulledKeys))
    .then(albums => sortByKey(usedSort, albums))
    .then(albums => E.right(albums as unknown as IAlbum[]))
    .catch(createError('Failed to get albums from database'));
}

export async function getAlbum(
  _: IBackMessagesHandler | undefined,
  { where, isShuffleOn }: IAlbumGetArgument,
): Promise<Either<IError, IAlbum>> {
  const include: Prisma.AlbumInclude = {
    tracks: true,
    artistEntry: true,
  };

  const usedSort = isShuffleOn ? 'RANDOM' : 'trackNo';

  const rawResponse = prisma.album.findUniqueOrThrow({
    where,
    include,
  }) as unknown as Promise<IAlbum>;

  return rawResponse
    .then(album => updateKeyValue('tracks', sortTracks(usedSort), album))
    .then(removeNulledKeys)
    .then(album => E.right(album as IAlbum))
    .catch(createError('Failed to get album from database'));
}

export async function getTracks(
  _?: IBackMessagesHandler,
  options?: ITrackFindManyArgument,
): Promise<Either<IError, readonly ITrack[]>> {
  const prismaOptions: Prisma.TrackFindManyArgs = { where: options?.where };

  const usedSort = options?.isShuffleOn ? 'RANDOM' : 'title';

  return prisma.track
    .findMany(prismaOptions)
    .then(RA.map(removeNulledKeys))
    .then(tracks => sortTracks(usedSort)(tracks as ITrack[]))
    .then(tracks => E.right(tracks as readonly ITrack[]))
    .catch(createError('Failed to get tracks from database'));
}

export async function getCovers(
  _?: IBackMessagesHandler,
  options?: Prisma.CoverFindManyArgs,
): Promise<Either<IError, readonly ICover[]>> {
  return prisma.cover
    .findMany(options)
    .then(RA.map(removeNulledKeys))
    .then(covers => E.right(covers as ICover[]))
    .catch(createError('Failed to get covers from database'));
}

export async function addTrackToDatabase(trackInput: Prisma.TrackCreateInput): Promise<Either<IError, ITrack>> {
  // await prisma.$queryRaw`PRAGMA foreign_keys = OFF`

  const result = prisma.track
    .upsert({
      where: {
        filepath: trackInput.filepath,
      },
      update: trackInput,
      create: trackInput,
    })
    .then(removeNulledKeys)
    .then(addedTrack => E.right(addedTrack as ITrack))
    .catch(createError('Failed to add track to database'));

  // await prisma.$queryRaw`PRAGMA foreign_keys = ON`

  return result;
}

export async function deleteTracksInverted(filepaths: readonly FilePath[]): Promise<Either<IError, number[]>> {
  const pathsString = createSQLArray(filepaths);

  const tracksQuery = prisma.$executeRawUnsafe(`
                DELETE FROM
                  ${SQL.Track}
                WHERE
                  ${SQL.filepath} NOT IN (${pathsString})`);

  const playlistItemsQuery = prisma.$executeRawUnsafe(`
    DELETE FROM
      ${SQL.PlaylistItem}
    WHERE
      ${SQL['PlaylistItem.trackID']} NOT IN (
        SELECT
          ${SQL['Track.id']}
        FROM
          ${SQL.Track}
        WHERE
          ${SQL['Track.filepath']} IN (
            ${pathsString}
        )
  )`);

  const pragmaOff = prisma.$executeRaw`PRAGMA foreign_keys = OFF`;
  const pragmaOn = prisma.$executeRaw`PRAGMA foreign_keys = On`;

  return (
    prisma
      .$transaction([pragmaOff, playlistItemsQuery, tracksQuery, pragmaOn])
      // Only get the amount of deleted tracks, not deleted items
      .then(([deletedPlaylistItemsAmount, deletedTracksAmount]) =>
        E.right([deletedPlaylistItemsAmount, deletedTracksAmount]),
      )
      .catch(createError('Failed to remove unused tracks from the database'))
  );
}

export async function deleteEmptyAlbums(): Promise<Either<IError, unknown>> {
  const query = `
    DELETE
    FROM
      ${SQL.Album}
    WHERE
      ${SQL.id} in (
        SELECT
          ${SQL['Album.id']}
        FROM
          ${SQL.Album}
          LEFT JOIN ${SQL.Track} ON ${SQL['Album.id']} = ${SQL['Track.albumID']}
        WHERE
          ${SQL['Track.title']} IS NULL
      )`;

  const queries = [
    prisma.$executeRaw`PRAGMA foreign_keys = OFF`,
    prisma.$executeRawUnsafe(query),
    prisma.$executeRaw`PRAGMA foreign_keys = ON`,
  ];

  const result = await prisma
    .$transaction(queries)
    .then(E.right)
    .catch(createError('Failed to remove unused albums from the database'));

  return result;
}

export async function deleteEmptyArtists(): Promise<Either<IError, unknown>> {
  const query = `
    DELETE FROM
      ${SQL.Artist}
    WHERE
      ${SQL.name} in (
        SELECT
          ${SQL['Artist.name']}
        FROM
          ${SQL.Artist}
          LEFT JOIN ${SQL.Track} ON ${SQL['Artist.name']} = ${SQL['Track.artist']}
          OR ${SQL['Artist.name']} = ${SQL['Track.albumartist']}
        WHERE
          ${SQL['Track.title']} IS NULL
      )`;

  const queries = [
    prisma.$executeRaw`PRAGMA foreign_keys = OFF`,
    prisma.$executeRawUnsafe(query),
    prisma.$executeRaw`PRAGMA foreign_keys = ON`,
  ];

  const result = await prisma
    .$transaction(queries)
    .then(E.right)
    .catch(createError('Failed to remove unused artists from the database'));

  return result;
}

export async function deleteUnusedCoversInDatabase(): Promise<Either<IError, unknown>> {
  const query = prisma.$executeRawUnsafe(`
    DELETE FROM
      ${SQL.Cover}
    WHERE
      ${SQL.filepath} in (
        SELECT
          ${SQL['Cover.filepath']}
        FROM
          ${SQL.Cover}
          LEFT JOIN ${SQL.Track} ON ${SQL['Cover.filepath']} = ${SQL['Track.cover']}
        WHERE
          ${SQL['Track.cover']} IS NULL

      AND ${SQL['Cover.md5']} NOT IN (
        SELECT
          A
        FROM
         _CoverToPlaylist
      )
  )`);

  const pragmaOff = prisma.$executeRaw`PRAGMA foreign_keys = OFF`;
  const pragmaON = prisma.$executeRaw`PRAGMA foreign_keys = ON`;

  return prisma
    .$transaction([pragmaOff, query, pragmaON])
    .then(E.right)
    .catch(createError('Failed to remove unused covers from the database'));
}

function addArtistImage<T extends { albums: readonly { cover?: string }[] }>(artist: T): T {
  // Get the artist image from one of his album covers. Later we will use an API for that
  const image = artist.albums.find(({ cover }) => cover !== undefined)?.cover;

  return {
    ...artist,
    image,
  };
}

function insertTracksIntoPlaylist(
  { id }: IPlaylist,
  insertionIndex: number,
): (trackIDs: readonly ITrackID[]) => Promise<Either<IError, IPlaylistWithItems>> {
  return async trackIDs => {
    const currentItems: Either<IError, readonly Prisma.PlaylistItemUncheckedCreateInput[]> = pipe(
      await getPlaylistWithItems(undefined, id),
      E.map(playlist =>
        pipe(
          playlist,
          // Get the items
          ({ items }) => items,
          // Remove the ID, but keep the rest.
          RA.map(({ trackID, playlistID, index }) => ({
            trackID,
            playlistID,
            index,
          })),
        ),
      ),
    );

    if (E.isLeft(currentItems)) {
      return currentItems; // Return the error
    }

    const itemsToInsert = trackIDs.map(createPlaylistItem(id, insertionIndex));

    return pipe(
      currentItems.right,

      insertIntoArray(insertionIndex, itemsToInsert),

      // Recalculate the index
      items => items.map((item, index) => ({ ...item, index })),

      // Add to the database
      newItems =>
        prisma.playlist
          .update({
            where: { id },
            data: { items: { create: newItems } },
            include: { items: { include: { track: true } } },
          })
          .then(playlist => E.right(playlist as unknown as IPlaylistWithItems))
          .catch(createError('Failed to update playlist')),
    );
  };
}

function appendTracksToPlaylist({
  id,
}: IPlaylist): (trackIDs: readonly ITrackID[]) => Promise<Either<IError, readonly IPlaylistItem[]>> {
  return async (trackIDs: readonly ITrackID[]) => {
    const currentLastIndex = await prisma.playlistItem.count({
      where: { playlistID: id },
    });

    const itemsToAppend = trackIDs.map(createPlaylistItem(id, currentLastIndex));

    return addPlaylistItemsToDatabase(itemsToAppend);
  };
}

async function addPlaylistItemsToDatabase(
  items: readonly Prisma.PlaylistItemUncheckedCreateInput[],
): Promise<Either<IError, readonly IPlaylistItem[]>> {
  const itemsToAdd: Prisma.Prisma__PlaylistItemClient<PlaylistItem, never>[] = items.map(data =>
    prisma.playlistItem.create({ data, include: { track: true } }),
  );

  return prisma
    .$transaction(itemsToAdd)
    .then(createdItems => E.right(createdItems as IPlaylistItem[]))
    .catch(createError('Failed to add items to playlist'));
}

async function getPlaylistNames(): Promise<Either<IError, readonly string[]>> {
  return prisma.playlist
    .findMany({ select: { name: true } })
    .then(RA.map(({ name }) => name))
    .then(E.right)
    .catch(createError('Failed to get playlist names'));
}

/**
 * Query by a music item, for example an album, and receive the tracks from it.
 * @param item A type which can contain tracks to retrieve, like an album or playlist.
 * @returns The tracks from the item
 */
export async function getTracksFromMusic(
  _: IBackMessagesHandler | undefined,
  item: IMusicIDsUnion,
): Promise<Either<IError, readonly ITrack[]>> {
  return match(item)
    .with({ type: 'artist' }, ({ name: artistNames }) => {
      if (Array.isArray(artistNames)) {
        return getTracksByArtistIDs(artistNames);
      }

      return getArtist(undefined, { where: { name: artistNames } }).then(E.map(({ tracks }) => tracks));
    })

    .with({ type: 'album' }, async ({ id }) => {
      if (Array.isArray(id)) {
        return getTracksByAlbumIDs(id);
      }

      return getAlbum(undefined, { where: { id } }).then(E.map(({ tracks }) => tracks));
    })

    .with({ type: 'track' }, ({ id }) => {
      if (Array.isArray(id)) return getTracksByIDs(id);

      return getTracks(undefined, { where: { id } });
    })

    .with({ type: 'playlist' }, ({ id: IDs }) => {
      if (Array.isArray(IDs)) {
        return getTracksByPlaylistIDs(IDs);
      }

      return getTracksFromPlaylists({
        where: { id: { in: Array.isArray(IDs) ? [...IDs] : IDs } },
      });
    })

    .exhaustive();
}

async function getTracksByAlbumIDs(IDs: readonly IAlbum['id'][]): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs);

  return prisma.$queryRaw`
    SELECT
      *
    FROM
      ${SQL.Track}
    WHERE
      ${SQL['Track.album']} IN (${IDsToInsert})`

    .then(tracks => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then(tracks => tracks as readonly ITrack[])
    .then(E.right)
    .catch(createError('Failed to get tracks from albums'));
}

async function getTracksByArtistIDs(IDs: readonly string[]): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs);

  return prisma.$queryRaw`
    SELECT
      *
    FROM
      ${SQL.Track}
    WHERE
      ${SQL['Track.artist']} IN (${IDsToInsert})`

    .then(tracks => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then(tracks => tracks as readonly ITrack[])
    .then(E.right)
    .catch(createError('Failed to get tracks from artists'));
}

async function getTracksByPlaylistIDs(IDs: readonly IPlaylistID[]): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs);

  return prisma.$queryRaw`
    SELECT
      ${SQL['Track.*']}
    FROM
      ${SQL.PlaylistItem}
      JOIN ${SQL.Track} ON ${SQL['Track.id']} = ${SQL['PlaylistItem.trackID']}
    WHERE
      ${SQL['PlaylistItem.playlistID']} IN (${IDsToInsert});`

    .then(tracks => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then(tracks => E.right(tracks as readonly ITrack[]))
    .catch(createError('Failed to get tracks from playlists'));
}

async function getTracksByIDs(IDs: readonly ITrackID[]): Promise<Either<IError, readonly ITrack[]>> {
  const IDsToInsert = createSQLArray(IDs);

  return prisma.$queryRaw`
    SELECT
      *
    FROM
      ${SQL.Track}
    WHERE
      ${SQL['Track.id']} IN (${IDsToInsert});`

    .then(tracks => tracks as readonly ITrack[])
    .then(RA.map(removeNulledKeys))
    .then(tracks => E.right(tracks as readonly ITrack[]))
    .catch(createError('Failed to get tracks from playlists'));
}
