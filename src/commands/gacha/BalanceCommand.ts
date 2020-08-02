import { Command } from 'diskat';

import { Context, UserDocument } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { injectUser } from '../middleware';

interface BalanceCommandContext extends Context {
  user: UserDocument;
}

const BalanceCommand: Command<BalanceCommandContext> = async (context) => {
  const { message, user } = context;

  return message.reply(`You have ${user.currency} 💎`);
};

BalanceCommand.config = {
  triggers: Trigger.BALANCE,
  middleware: [
    injectUser(),
  ],
  description: 'View your balance',
  group: CommandGroupName.GACHA,
};

export default BalanceCommand;
