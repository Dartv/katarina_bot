import { Bench } from '../models';
import { Job } from '../types';
import { MWL_BASE_URL } from '../utils/constants';
import { rollExternalCharacter } from '../utils/roll';

const JOB_NAME = 'BENCH_RETRY';

export const BenchRetryJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      await Bench.find({}).cursor().eachAsync(async ({ slug }) => {
        try {
          await rollExternalCharacter(`${MWL_BASE_URL}/waifu/${slug}`);

          client.logger.log(`Unbenching ${slug}...`);

          await Bench.deleteOne({ slug });
        } catch (err) {
          client.logger.error(`Could not fetch benched character: ${slug}`);
          client.logger.error(err);
        }
      });

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  agenda.every('30 0 * * *', JOB_NAME);
};
