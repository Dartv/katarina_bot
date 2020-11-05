import { VersusCommand } from '../commands';
import { Job } from '../types';
import { Trigger } from '../utils/constants';

const JOB_NAME = 'VERSUS';

export const VersusJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const context = client.dispatcher.createContext({
        command: client.commands.get(Trigger.VERSUS[0]),
        message: null,
        args: {
          stars: 5,
        },
      });

      await VersusCommand(context);

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  agenda.every('0 6 * * *', JOB_NAME);
};
