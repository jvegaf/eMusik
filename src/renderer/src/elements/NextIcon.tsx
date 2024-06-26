import classes from './PlayIcon.module.css';

export function NextIcon() {
  return (
    <div className={classes.iconRoot}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
      >
        <path d='M0 19v-14l12 7-12 7zm12 0v-14l12 7-12 7z' />
      </svg>
    </div>
  );
}
