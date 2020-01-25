import random from 'random-int';
import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';

const handler: ICommandHandler = async (context): Promise<string> => {
  const { message: { mentions } } = context;

  if (!mentions.members.size) return null;

  return `${mentions.members.first().displayName} is ${random(0, 100)}% gay 🏳️‍🌈`;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.GAY,
  description: 'How gay is someone?',
});
