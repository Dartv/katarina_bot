import Agenda from 'agenda';
import { Client } from 'ghastly';
import { Mission } from '../models';

const JOB_NAME = 'reset missions';

export default (agenda: Agenda, client: Client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      await Mission.updateMany(
        {
          resetsAt: {
            $lte: new Date(),
          },
        },
        {
          $set: {
            progress: 0,
          },
          $unset: {
            completedAt: '',
          },
        },
      );
    } catch (err) {
      console.error(`Failed job ${JOB_NAME}`);
      console.error(err);
      job.fail(err);
      await job.save();
    }

    done();
  });

  agenda.every('0 * * * *', JOB_NAME);
};
