import { RichEmbed, GuildMember } from 'discord.js';
import { pluck } from 'ramda';

import { ICommand } from '../types';
import {
  COMMAND_TRIGGERS,
  COLORS,
  Emoji,
  MarriageStatus,
} from '../util';
import { Character, User, Marriage } from '../models';
import { ErrorResponse } from './responses';
import { injectUser, injectGuild } from './middleware';

const { BOT_PREFIX } = process.env;

const handler = async (context): Promise<any> => {
  try {
    const { message, dispatch, guild } = context;
    let { user } = context;
    const member = message.mentions.members.first() || context.message.member;

    if (message.mentions.members.size) {
      user = await (User as any).findOneByDiscordId(member.id);
    }

    if (!user) {
      return ErrorResponse(`Couldn't find user ${member.displayName}`, context);
    }

    const [characterStats, marriedMember] = await Promise.all([
      Character.aggregate([
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
      ]),
      (async (): Promise<GuildMember|null> => {
        const marriage = await Marriage.findOne({
          guild: guild._id,
          status: MarriageStatus.MARRIED,
          $or: [
            { husband: user._id },
            { wife: user._id },
          ],
        });

        if (!marriage) return null;

        const marriedToId = marriage.husband.equals(user._id) ? marriage.wife : marriage.husband;
        const marriedTo = await User.findById(marriedToId);
        const marriedToMember = await message.guild.fetchMember((marriedTo as any).discordId);
        return marriedToMember;
      })(),
    ]);

    const marryExample = `${process.env.BOT_PREFIX}${COMMAND_TRIGGERS.MARRY[0]} @user`;
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
        {
          name: 'Married to',
          value: marriedMember ? marriedMember.displayName : `Marry someone by typing ${marryExample}`,
        },
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
      ],
    });

    await dispatch(embed);

    return null;
  } catch (err) {
    console.error(err);
    return ErrorResponse('Couldn\'t display your profile', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser(), injectGuild()],
  handler,
  triggers: COMMAND_TRIGGERS.PROFILE,
  description: 'Profile of the mentioned user',
});
