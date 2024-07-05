import { Text, Image } from '@mantine/core';
import classes from './PlayerDisplay.module.css';
import PlaceHolder from '../assets/placeholder.png';

type PlayerDisplayProps = {
  title: string;
  artist: string;
  artSrc: string | null;
};

const PlayerDisplay = (props: PlayerDisplayProps) => {
  return (
    <div className={classes.playerDisplayRoot}>
      <div className={classes.playerDisplayImage}>
        <Image
          h={80}
          src={props.artSrc}
          fallbackSrc={PlaceHolder}
        />
      </div>
      <div className={classes.playerDisplayData}>
        <Text
          size='md'
          fw={700}
        >
          {/* {props.title} */}
          One More Time
        </Text>
        <Text size='sm'>
          {/* {props.artist} */}
          Daft Punk
        </Text>
      </div>
    </div>
  );
};

export default PlayerDisplay;
