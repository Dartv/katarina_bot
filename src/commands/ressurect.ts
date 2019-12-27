import { Message } from 'discord.js';

import { ICommand, ICommandHandler } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { ErrorResponse } from './responses';

const handler: ICommandHandler = async (context): Promise<any> => {
  const { message } = context;

  if (!message.mentions.members.size) return null;

  const targetMember = message.mentions.members.first();

  await message.reply(`You want to ressurect ${targetMember.displayName}. To do so kiss ${targetMember.displayName} 💋`);

  const predicate = ({ mentions }: Message): boolean => mentions.members.has(targetMember.id);
  const options = {
    time: 15000,
    maxMatches: 1,
    errors: ['time'],
  };

  try {
    await message.channel.awaitMessages(predicate, options);
    await message.reply(`You've successfully ressurected ${targetMember.displayName} with the power of love! ❤️`);
    return null;
  } catch (err) {
    return ErrorResponse(`Are you not brave enough to kiss ${targetMember.displayName}? What a pussy!`, context);
  }
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.RESSURECT,
  description: 'Ressurect someone',
});
