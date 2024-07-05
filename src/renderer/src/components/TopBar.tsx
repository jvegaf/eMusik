import { Autocomplete } from '@mantine/core';
import classes from './TopBar.module.css';

const data = Array(100)
  .fill(0)
  .map((_, index) => `Option ${index}`);
const TopBar = () => {
  return (
    <div className={classes.topbarRoot}>
      <Autocomplete
        classNames={{ wrapper: classes.wrapper }}
        placeholder='Search'
        data={data}
        maxDropdownHeight={200}
      />
    </div>
  );
};

export default TopBar;
