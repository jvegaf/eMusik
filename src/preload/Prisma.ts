import path from 'node:path';
import { fork } from 'node:child_process';

import log from 'electron-log';

import { databaseURL, migrationEnginePath, queryEnginePath } from './Constants';

import { PrismaClient } from '@prisma/client';

log.info('DB URL', databaseURL);
log.info('QE Path', queryEnginePath);

export const prisma = new PrismaClient({
  log: [
    'info',
    'warn',
    'error',
    //     {
    //     emit: "event",
    //     level: "query",
    // },
  ],
  datasources: {
    db: {
      url: databaseURL,
    },
  },
  // see https://github.com/prisma/prisma/discussions/5200
  // @ts-expect-error internal prop
  __internal: {
    engine: {
      binaryPath: queryEnginePath,
    },
  },
});

export async function runPrismaCommand({
  command,
  urlToDatabase,
}: {
  command: string[];
  urlToDatabase: string;
}): Promise<number> {
  log.info('Migration engine path', migrationEnginePath);
  log.info('Query engine path', queryEnginePath);

  // Currently we don't have any direct method to invoke prisma migration programatically.
  // As a workaround, we spawn migration script as a child process and wait for its completion.
  // Please also refer to the following GitHub issue: https://github.com/prisma/prisma/issues/4703
  try {
    const exitCode = await new Promise((resolve, _) => {
      const prismaPath = path.resolve(__dirname, '..', '..', '..', 'node_modules/prisma/build/index.js');
      log.info('Prisma path', prismaPath);

      const child = fork(prismaPath, command, {
        env: {
          ...process.env,
          DATABASE_URL: urlToDatabase,
          PRISMA_MIGRATION_ENGINE_BINARY: migrationEnginePath,
          PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath,

          // Prisma apparently needs a valid path for the format and introspection binaries, even though
          // we don't use them. So we just point them to the query engine binary. Otherwise, we get
          // prisma:  Error: ENOTDIR: not a directory, unlink '/some/path/electron-prisma-trpc-example/packed/mac-arm64/ElectronPrismaTrpcExample.app/Contents/Resources/app.asar/node_modules/@prisma/engines/prisma-fmt-darwin-arm64'
          PRISMA_FMT_BINARY: queryEnginePath,
          PRISMA_INTROSPECTION_ENGINE_BINARY: queryEnginePath,
        },
        stdio: 'pipe',
      });

      child.on('message', message => {
        log.info(message);
      });

      child.on('error', error => {
        log.error('Child process got error:', error);
      });

      child.on('close', (code, __) => {
        resolve(code);
      });

      child.stdout?.on('data', function (data) {
        log.info('prisma: ', data.toString());
      });

      child.stderr?.on('data', function (data) {
        log.error('prisma: ', data.toString());
      });
    });

    if (exitCode !== 0) throw new Error(`command ${command} failed with exit code ${exitCode}`);

    return exitCode;
  } catch (error) {
    log.error(error);
    throw error;
  }
}
