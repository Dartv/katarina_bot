import * as Jobs from '../jobs';

const jobs = Object.values(Jobs);

export const CronService = {
  start: () => jobs.forEach(job => job.start()),
  stop: () => jobs.forEach(job => job.stop()),
};
