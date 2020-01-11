import { ICommand } from '../types';
import { COMMAND_TRIGGERS, Emoji } from '../util';

const handler = async (context): Promise<string> => {
  const { message: { mentions } } = context;

  if (!mentions.members.size) return null;

  const { displayName } = mentions.members.first();

  return `${displayName} is ${Math.random() >= 0.5 ? `lying ${Emoji.LIAR}` : `not lying ${Emoji.SPRAVEDLIVO}`}`;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.LIAR,
  description: 'Is someone lying?',
});
