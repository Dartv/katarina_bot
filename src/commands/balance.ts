import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import { injectUser } from './middleware';

const middleware = [
  injectUser(),
];

const handler: ICommandHandler = async (context): Promise<any> => {
  const { user, message } = context;

  return message.reply(`You have ${user.currency} katacoins 💎`);
};

export default (): ICommand => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.BALANCE,
  description: 'Shows your balance',
});
