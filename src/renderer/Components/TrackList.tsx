import { Table } from '@geist-ui/core';
import { Track } from '../../shared/types/emusik';

type Props = {
  tracks: Track[];
};

const TrackList = (props: Props) => {
  const { tracks } = props;

  return (
    <Table<Track> data={tracks}>
      <Table.Column<Track> prop="title" label="Title" />
      <Table.Column<Track> prop="artist" label="Artist" />
      <Table.Column<Track> prop="album" label="Album" />
    </Table>
  );
};

export default TrackList;