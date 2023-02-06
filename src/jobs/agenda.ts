/* eslint-disable @typescript-eslint/no-var-requires, global-require */

import { Agenda, Job as AgendaJob } from '@hokify/agenda';
import mongoose from 'mongoose';

import { Client } from '../services/client';
import * as jobs from '.';
import { Job } from '../types';

const { MONGO_URI } = process.env;

export const initJobs = (client: Client): Agenda => {
  const agenda = new Agenda({
    db: { address: MONGO_URI, collection: 'agendaJobs' },
    defaultConcurrency: Number.MAX_SAFE_INTEGER,
    maxConcurrency: Number.MAX_SAFE_INTEGER,
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

    try {
      await agenda.start();

      client.logger.success('Successfully started agenda');
    } catch (err) {
      client.logger.fatal('Failed to start agenda. Exiting...');
      process.exit(1);
    }

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

  agenda.on('fail', (err, job: AgendaJob) => {
    client.logger.error(`Failed job "${job.attrs.name}"`, err);
  });

  return agenda;
};
