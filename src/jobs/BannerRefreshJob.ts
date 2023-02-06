import { Banner } from '../models';
import { Job } from '../types';
import { DAILY_RESET_CRON } from './constants';

const JOB_NAME = 'BANNER_REFRESH';

export const BannerRefreshJob: Job = (agenda) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const banner = await Banner.fetchLatest();

      if (banner.isExpired()) {
        await Banner.refresh();
      }

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  agenda.every(DAILY_RESET_CRON, JOB_NAME);
};
