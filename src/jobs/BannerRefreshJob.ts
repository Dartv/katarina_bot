import { Banner } from '../models';
import { Job } from '../types';

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

  agenda.every('0 6 * * *', JOB_NAME);
};
