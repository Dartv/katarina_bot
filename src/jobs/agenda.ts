/* eslint-disable @typescript-eslint/no-var-requires, global-require */

import { Agenda, Job as AgendaJob } from '@hokify/agenda';
import mongoose from 'mongoose';

import { Client } from '../services/client';
import * as jobs from '.';
import { Job } from '../types';
import { DAILY_RESET_CRON } from './constants';

const { MONGO_URI } = process.env;

// runs jobs that are overdue
// happens when server is down and job does not run at a scheduled time
const runOverdueJobs = async (agenda: Agenda, client: Client) => {
  /* eslint-disable no-await-in-loop */
  for (const job of await agenda.jobs()) {
    try {
      // job that run on daily reset
      if (job.attrs.repeatInterval === DAILY_RESET_CRON && !(await job.isRunning())) {
        const lastRunAt = job.attrs.lastRunAt || new Date(null);
        const distanceInHours = Math.abs(job.attrs.nextRunAt.getTime() - lastRunAt.getTime()) / 1000 / 60 / 60;

        if (distanceInHours > 24) {
          await job.run();
          await job.save();
        }
      }
    } catch (err) {
      client.logger.error(`Failed to run overdue job ${job.attrs.name}`, err);
    }
  }
  /* eslint-enable no-await-in-loop */
};

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

    runOverdueJobs(agenda, client);
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
