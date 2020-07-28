import { Command, Middleware } from 'diskat';
import {
  Trigger,
  CommandGroupName,
  DAILY_CURRENCY,
  MissionCode,
} from '../../utils/constants';
import { Context, UserDocument } from '../../types';
import { injectUser } from '../middleware';
import { Mission } from '../../models';
import { CooldownResponse } from '../responses';

interface DailyCommandContext extends Context {
  user: UserDocument;
}

const applyCooldown = (): Middleware<DailyCommandContext, DailyCommandContext> => async (next, context) => {
  const { user } = context;
  const mission = await Mission.findOne({ code: MissionCode.CURRENCY_DAILY, user: user._id });

  if (mission.completedAt) {
    return new CooldownResponse(context, new Date(mission.resetsAt));
  }

  return next(context);
};

const DailyCommand: Command<DailyCommandContext> = async (context) => {
  const { user, message } = context;

  user.currency += DAILY_CURRENCY;

  await user.save();

  return message.reply(`You acquired ${DAILY_CURRENCY} 💎`);
};

DailyCommand.config = {
  triggers: Trigger.DAILY,
  description: 'Acquire daily 💎',
  group: CommandGroupName.GACHA,
  middleware: [
    injectUser(),
    applyCooldown(),
    async (next, context: Context) => {
      const result = await next(context);
      context.client.emitter.emit('mission', MissionCode.CURRENCY_DAILY, result, context);
      return result;
    },
  ],
};

export default DailyCommand;
