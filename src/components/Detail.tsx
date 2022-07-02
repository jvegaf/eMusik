/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Track } from '../../electron/types/emusik';
import Placeholder from '../assets/placeholder.png';
import useAppState from '../hooks/useAppState';

function Detail() {
  const { trackDetail, onFindArtwork, closeDetail, saveChanges } = useAppState();
  const [artSrc, setArtSrc] = useState(Placeholder);
  const { register, handleSubmit } = useForm();

  React.useEffect(() => {
    if (trackDetail) {
      const { artwork } = trackDetail;
      if (artwork) {
        const blob = new Blob([artwork.imageBuffer], {
          type: artwork.mime
        });

        const artData = URL.createObjectURL(blob);
        setArtSrc(artData);
      }
    }
  }, [trackDetail]);

  const onCancel = () => closeDetail();

  const findArtwork = () => onFindArtwork(trackDetail as Track);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    const updated = { ...trackDetail, ...data };
    saveChanges(updated);
    closeDetail();
  };

  return (
    <div className="pt-4 h-full bg-neutral-700">
      {trackDetail && (
        <form className="w-full max-w-xl m-auto" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-rows-8 gap-3">
            <div>
              <label className="font-normal text-md text-neutral-400">Title</label>
              <input
                className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                defaultValue={trackDetail.title}
                {...register('title')}
              />
            </div>
            <div>
              <label className="font-normal text-md text-neutral-400">Artist</label>
              <input
                className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                defaultValue={trackDetail.artist}
                {...register('artist')}
              />
            </div>
            <div>
              <label className="font-normal text-md text-neutral-400">Album</label>
              <input
                className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                defaultValue={trackDetail.album}
                {...register('album')}
              />
            </div>
            <div className="row-span-4 grid grid-cols-2 gap-2">
              <div className="flex justify-center items-center ">
                <div className="transform transition duration-300 hover:scale-105 hover: cursor-pointer flex justify-center items-center">
                  <img onClick={findArtwork} src={artSrc} className="rounded-md" width={250} height={250} alt="" />
                </div>
              </div>
              <div>
                <div>
                  <label className="font-normal text-md text-neutral-400">Genre</label>
                  <input
                    className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                    defaultValue={trackDetail.genre}
                    {...register('genre')}
                  />
                </div>
                <div>
                  <label className="font-normal text-md text-neutral-400">Bpm</label>
                  <input
                    type="number"
                    className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                    defaultValue={trackDetail.bpm}
                    {...register('bpm')}
                  />
                </div>
                <div>
                  <label className="font-normal text-md text-neutral-400">Key</label>
                  <input
                    className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                    defaultValue={trackDetail.key}
                    {...register('key')}
                  />
                </div>
                <div>
                  <label className="font-normal text-md text-neutral-400">Year</label>
                  <input
                    type="number"
                    className="border-solid border-neutral-400 border py-2 px-4 w-full text-lg rounded text-neutral-100 bg-stone-700"
                    defaultValue={trackDetail.year}
                    {...register('year')}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end pt-6 gap-8">
              <button
                className="bg-stone-600 text-white rounded py-2 px-6 focus:outline-none hover:bg-stone-700 hover:border"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="bg-sky-500  text-white rounded py-2 px-8 focus:outline-none hover:bg-sky-600 hover:border"
                type="submit"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Detail;