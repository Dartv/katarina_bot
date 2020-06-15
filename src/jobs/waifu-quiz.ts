import Agenda from 'agenda';
import { Client } from 'ghastly';
import { TextChannel, Message } from 'discord.js';

import { handler } from '../commands/whatseries';
import { User } from '../models';
import { IUser } from '../models/user/types';
import { withMission } from '../commands/middleware';
import { MissionCode, RewardTable } from '../util';
import { IMission } from '../models/mission/types';
import { getDailyResetDate } from '../util/daily';
import { createContext } from '../util/command';

const JOB_NAME = 'waifu quiz';
const CHANNEL_NAME = 'waifu-quiz';
const CURRENCY = 10;

const completeQuizMission = async (user: IUser, message: Message, client: Client): Promise<void> => {
  const middleware = withMission(async () => ({
    code: MissionCode.QUIZ,
    reward: RewardTable.QUIZ,
    update: async (mission): Promise<IMission> => {
      Object.assign(mission, {
        resetsAt: getDailyResetDate(),
        progress: mission.progress + 1,
      });

      if (mission.progress >= 5) {
        Object.assign(mission, {
          completedAt: new Date(),
        });
      }

      return mission;
    },
  }));
  const context = createContext({
    user,
    message,
    client,
  });

  await middleware(() => null, context);
};

export default (agenda: Agenda, client: Client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const promises = client.channels
        .filter((channel: TextChannel) => channel.name === CHANNEL_NAME)
        .map(async (channel: TextChannel) => {
          const message = await handler({
            dispatch: (response) => client.dispatcher.dispatchResponse(channel, response),
            message: { channel },
            args: {},
            clearCooldown: () => null,
          } as any);

          const member = message?.mentions?.members?.first();
          if (member) {
            const user = await User.findOne({ discordId: member.id });
            if (user) {
              user.currency += CURRENCY;
              user.correctQuizGuesses += 1;
              await user.save();
              await channel.send(`${member} received ${CURRENCY}💎`);
              await completeQuizMission(user, message, client);
            }
          }
        });
      await Promise.all(promises);
    } catch (err) {
      console.error(`Failed job ${JOB_NAME}`);
      console.error(err);
      job.fail(err);
      await job.save();
    }

    done();
  });

  agenda.every('30 seconds', JOB_NAME);
};
