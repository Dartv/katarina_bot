/* eslint-disable @typescript-eslint/no-var-requires, global-require */

import Agenda from 'agenda';
import mongoose from 'mongoose';
import { addMinutes } from 'date-fns';

import { Client } from '../services/client';
import * as jobs from '.';
import { Job } from '../types';

export const initJobs = (client: Client): void => {
  const agenda = new Agenda({
    mongo: mongoose.connection.db,
  });

  // Restart agenda when mongoose recovers connection
  mongoose.connection.on('reconnected', async () => {
    client.logger.info('Restarting agenda...');
    try {
      await agenda.stop();
      await agenda.start();
      client.logger.success('Successfully restarted agenda!');
    } catch (err) {
      client.logger.fatal('Failed to restart agenda. Exiting...');
      process.exit(1);
    }
  });

  agenda.on('ready', async () => {
    client.logger.info('Starting agenda');
    await agenda.start();

    Object.values(jobs).forEach((job: Job) => job(agenda, client));
  });

  agenda.on('start', (job) => {
    client.logger.info(`Starting job "${job.attrs.name}"...`);
  });

  agenda.on('complete', (job) => {
    client.logger.info(`Job ${job.attrs.name} finished...`);
  });

  agenda.on('error', (err) => {
    client.logger.error('[Agenda Error]:', err);
  });

  agenda.on('fail', (err, job: Agenda.Job) => {
    client.logger.error(`Failed job "${job.attrs.name}"`, err);
    // retry 1 minute later
    // eslint-disable-next-line no-param-reassign
    job.attrs.nextRunAt = addMinutes(new Date(), 1);
    job.save().catch(client.logger.error);
  });
};
