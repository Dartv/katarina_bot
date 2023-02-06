import { Job } from '../types';
import { Mission } from '../models';
import { getDailyResetDate } from '../utils/daily';
import { MissionType } from '../utils/constants';

const JOB_NAME = 'RESET_MISSIONS';

export const ResetMissionsJob: Job = (agenda) => {
  agenda.define(JOB_NAME, async (job, done) => {
    done();

    try {
      await Mission.updateMany(
        {
          resetsAt: {
            $lte: new Date(),
          },
          type: MissionType.REGULAR,
        },
        {
          $set: {
            progress: 0,
            resetsAt: getDailyResetDate(),
          },
          $unset: {
            completedAt: '',
          },
        },
      );
    } catch (err) {
      job.fail(err);
      await job.save();
    }
  });

  agenda.every('0 6 * * *', JOB_NAME);
};
