import { Command } from 'diskat';
import { Trigger, CommandGroupName, DAILY_CURRENCY } from '../../utils/constants';
import { Context, UserDocument } from '../../types';

interface DailyCommandContext extends Context {
  user: UserDocument;
}

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
};

export default DailyCommand;
