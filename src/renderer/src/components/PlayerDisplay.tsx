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
          h={70}
          src={props.artSrc}
          fallbackSrc={PlaceHolder}
        />
      </div>
      <div className={classes.playerDisplayData}>
        <Text
          size='md'
          fw={700}
          truncate="end"
        >
          {props.title}
        </Text>
        <Text truncate="end" size='sm'>
          {props.artist}
        </Text>
      </div>
    </div>
  );
};

export default PlayerDisplay;
