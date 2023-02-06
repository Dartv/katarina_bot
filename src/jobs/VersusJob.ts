import { VersusCommand } from '../commands';
import { Job } from '../types';
import { Trigger } from '../utils/constants';
import { DAILY_RESET_CRON } from './constants';

const JOB_NAME = 'VERSUS';

export const VersusJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    done();

    try {
      const context = client.dispatcher.createContext({
        command: client.commands.get(Trigger.VERSUS[0]),
        message: null,
        args: {
          stars: 5,
        },
      });

      await VersusCommand(context);
    } catch (err) {
      job.fail(err);
      await job.save();
    }
  });

  agenda.every(DAILY_RESET_CRON, JOB_NAME);
};
