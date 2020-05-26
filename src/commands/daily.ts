import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS, RewardTable, MissionCode } from '../util';
import { injectUser, withPersonalCooldown, withMission } from './middleware';
import { IMission } from '../models/mission/types';
import { getDailyResetDate } from '../util/daily';

const CURRENCY = 500;

const middleware = [
  injectUser(),
  withPersonalCooldown({ daily: true }),
  withMission(async () => ({
    code: MissionCode.DAILY,
    reward: RewardTable.DAILY,
    update: async (mission): Promise<IMission> => {
      Object.assign(mission, {
        resetsAt: getDailyResetDate(),
        completedAt: new Date(),
      });

      return mission;
    },
  })),
];

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message } = context;

  user.currency += CURRENCY;

  await user.save();

  await message.reply(`You acquired ${CURRENCY}💎`);

  return null;
};

export default (): ICommand => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.DAILY,
  description: 'Acquire daily currency',
});
