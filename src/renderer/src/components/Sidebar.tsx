import { List, Space, ThemeIcon, UnstyledButton, rem } from '@mantine/core';
import classes from './Sidebar.module.css';
import { IconCircleCheck, IconCircleDashed, IconHeadphonesFilled } from '@tabler/icons-react';

export default function Sidebar() {
  return (
    <div className={classes.sbContainer}>
      <div className={classes.sbHeader}></div>
      <UnstyledButton className={classes.mainLink}>
        <div className={classes.mainLinkInner}>
          <IconHeadphonesFilled
            size={20}
            className={classes.mainLinkIcon}
            stroke={1.5}
          />
          <span>Library</span>
        </div>
      </UnstyledButton>

      <List
        spacing='md'
        size='sm'
        center
        icon={
          <ThemeIcon
            color='teal'
            size={24}
            radius='xl'
          >
            <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
          </ThemeIcon>
        }
      >
        <List.Item>Clone </List.Item>
        <List.Item>Install </List.Item>
        <List.Item>To start </List.Item>
        <List.Item>Run testsd</List.Item>
        <List.Item
          icon={
            <ThemeIcon
              color='blue'
              size={24}
              radius='xl'
            >
              <IconCircleDashed style={{ width: rem(16), height: rem(16) }} />
            </ThemeIcon>
          }
        >
          Submit a pull request once you are done
        </List.Item>
      </List>
    </div>
  );
}
