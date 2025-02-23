import log from 'electron-log';
import Module from '../modules/BaseModule';

export const init = async (...modules: Module[]): Promise<void> => {
  await Promise.allSettled(
    modules.map(module =>
      module.init().catch(err => {
        throw err;
      }),
    ),
  ).catch(err => {
    log.error(`An error occured when loading ${module.constructor.name} could not be loaded:\n${err}`);
  });
};
