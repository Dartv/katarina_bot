import { RichEmbed } from 'discord.js';
import { pluck } from 'ramda';

import { ICommand } from '../types';
import { COMMAND_TRIGGERS, COLORS, Emoji } from '../util';
import { Character, User } from '../models';
import { ErrorResponse } from './responses';
import { injectUser } from './middleware';

const { BOT_PREFIX } = process.env;

const handler = async (context): Promise<any> => {
  try {
    const { message, dispatch } = context;
    let { user } = context;
    const member = message.mentions.members.first() || context.message.member;

    if (message.mentions.members.size) {
      user = await (User as any).findOneByDiscordId(member.id);
    }

    if (!user) {
      return ErrorResponse(`Couldn't find user ${member.displayName}`, context);
    }

    const characterStats = await Character.aggregate([
      {
        $match: {
          _id: { $in: user.characters },
        },
      },
      {
        $group: {
          _id: '$stars',
          stars: { $first: '$stars' },
          count: { $sum: 1 },
        },
      },
      { $sort: { stars: 1 } },
    ]);

    const embed = new RichEmbed({
      title: `${member.displayName}'s profile`,
      description: user.quote ? `"${user.quote}"` : `Set your quote with ${BOT_PREFIX}${COMMAND_TRIGGERS.SET_QUOTE[0]}`,
      color: COLORS.INFO,
      ...(user.waifu && {
        image: { url: user.waifu.imageUrl },
      }),
      fields: [
        { name: 'Waifus owned', value: user.characters.length },
        { name: 'Favorites', value: user.favorites.length },
        ...characterStats.map(({ stars, count }) => ({
          name: Emoji.STAR.repeat(stars),
          value: count,
        })),
        ...(user.waifu ? [
          { name: 'Waifu', value: user.waifu.name },
          {
            name: 'Series',
            value: pluck('title', user.waifu.series as any[]).join(', ') || '...',
          },
        ] : [
          { name: 'Waifu', value: `Set your waifu with ${BOT_PREFIX}${COMMAND_TRIGGERS.SET_WAIFU[0]}` },
        ]),
      ].map((field, i, fields) => ({ ...field, inline: i !== fields.length - 1 })),
    });

    await dispatch(embed);

    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t display your profile', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser()],
  handler,
  triggers: COMMAND_TRIGGERS.PROFILE,
  description: 'Profile of the mentioned user',
});
