import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import { injectUser, withPersonalCooldown } from './middleware';

const CURRENCY = 500;

const middleware = [
  injectUser(),
  withPersonalCooldown({ daily: true }),
];

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message } = context;

  user.currency += CURRENCY;

  await user.save();

  await message.reply(`You acquired ${CURRENCY} katacoins 💎`);

  return null;
};

export default (): ICommand => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.DAILY,
  description: 'Acquire daily currency',
});
