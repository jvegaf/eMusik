import classes from './Player.module.css';
import { PlayerControl } from './PlayerControl';

export default function Player() {
  return (
    <header className={classes.header}>
      <PlayerControl />
    </header>
  );
}
