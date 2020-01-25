import { Message } from 'discord.js';
import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS, MarriageStatus } from '../util';
import { injectUser, injectGuild } from './middleware';
import { Marriage, User } from '../models';
import { ErrorResponse } from './responses';

const handler: ICommandHandler = async (context) => {
  const { user, guild, message } = context;

  const marriage = await Marriage.findOne({
    guild: guild._id,
    status: MarriageStatus.MARRIED,
    $or: [
      { husband: user._id },
      { wife: user._id },
    ],
  });

  if (!marriage) {
    return ErrorResponse('You\'re not married to anyone right now', context);
  }

  const marriedToId = marriage.husband.equals(user._id) ? marriage.wife : marriage.husband;
  const marriedTo = await User.findById(marriedToId);
  const marriedToMember = await message.guild.fetchMember((marriedTo as any).discordId);

  if (!marriedToMember) {
    // user probably left guild
    await marriage.remove();
    await message.reply('Your marriage was divorced');
  }

  await message.reply(
    `Are you sure you want to divorce marriage with ${marriedToMember.displayName}? Type "yes" if you do.`,
  );
  const predicate = ({ content }: Message): boolean => /^yes$/i.test(content);
  const options = {
    time: 10 * 1000,
    maxMatches: 1,
    errors: ['time'],
  };

  try {
    await message.channel.awaitMessages(predicate, options);
  } catch (err) {
    return ErrorResponse(
      `You didn't want to divorce your marriage in the end... Stay happy with ${marriedToMember.displayName} ❤️`,
      context,
    );
  }

  await marriage.remove();
  await message.reply(`Your marriage with ${marriedToMember.displayName} was divorced 💔`);

  return null;
};

export default (): ICommand => ({
  middleware: [injectUser(), injectGuild()],
  handler,
  triggers: COMMAND_TRIGGERS.DIVORCE,
  description: 'Divorce your marriage',
});
