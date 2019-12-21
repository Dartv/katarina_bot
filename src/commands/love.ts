import random from 'random-int';
import { ICommand } from '../types';
import { COMMAND_TRIGGERS } from '../util';

const handler = async (context): Promise<string> => {
  const { message: { mentions, member } } = context;

  if (!mentions.members.size) return null;

  return `There's ${random(0, 100)}% ♥️ between ${member.displayName} and ${mentions.members.first().displayName}`;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.LOVE,
  description: 'How much love is there between you and someone else?',
});
