import { Flex, Text } from '@mantine/core';

type PlayerDisplayProps = {
  title: string;
  artist: string;
};

const PlayerDisplay = (props: PlayerDisplayProps) => {
  return (
    <div>
      <Flex
        mih={50}
        bg='rgba(0, 0, 0, .3)'
        gap='md'
        justify='flex-start'
        align='flex-start'
        direction='column'
        wrap='wrap'
      >
        <Text
          size='md'
          fw={700}
        >
          {props.title}
        </Text>
        <Text size='sm'>{props.artist}</Text>
      </Flex>
    </div>
  );
};

export default PlayerDisplay;
