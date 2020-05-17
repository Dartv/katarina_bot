/* eslint-disable @typescript-eslint/no-var-requires, global-require */

import Agenda from 'agenda';
import mongoose from 'mongoose';
import { Client } from 'ghastly';

import { logger } from '../util/logger';
import { isProduction } from '../util/environment';

const jobs = [
  require('./battle-royale'),
];

if (isProduction()) {
  jobs.push(require('./monitor-scoresaber-players'));
}

export default function initAgenda(client: Client): void {
  const agenda = new Agenda({
    mongo: mongoose.connection as any,
  });

  // Restart agenda when mongoose recovers connection
  mongoose.connection.on('reconnected', async () => {
    logger.info('Restarting agenda...');
    try {
      await agenda.stop();
      await agenda.start();
      logger.success('Successfully restarted agenda!');
    } catch (err) {
      logger.fatal('Failed to restart agenda. Exiting...');
      process.exit(1);
    }
  });

  agenda.on('ready', async () => {
    logger.info('Starting agenda');
    await agenda.start();

    jobs.forEach(job => job.default(agenda, client));
  });

  agenda.on('start', (job) => {
    logger.info(`Starting job "${job.attrs.name}"...`);
  });

  agenda.on('complete', (job) => {
    logger.info(`Job ${job.attrs.name} finished...`);
  });

  agenda.on('error', (err, job) => {
    logger.error(`[Agenda Error]: at job ${job}`, err);
  });
}
