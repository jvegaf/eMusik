import fs from 'fs';
import log from 'electron-log/main';

export function ExtractToFile(jsonObj: unknown, filename: string) {
  const jsonContent = JSON.stringify(jsonObj, null, 2);
  const today = new Date();

  const fname = `./${today.getSeconds()}${today.getMinutes()}${filename}.json`;

  // eslint-disable-next-line consistent-return
  fs.writeFile(fname, jsonContent, 'utf8', (err) => {
    if (err) {
      log.error('An error occured while writing JSON Object to File.');
      return log.error(err);
    }
  });
}
