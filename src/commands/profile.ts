import { RichEmbed, GuildMember } from 'discord.js';
import { pluck } from 'ramda';
import { formatDistance } from 'date-fns';
import { ICommand, ICommandHandler, ICommandContext } from 'ghastly';

import {
  COMMAND_TRIGGERS,
  COLORS,
  Emoji,
  MarriageStatus,
} from '../util';
import { Character, User, Marriage } from '../models';
import { ErrorResponse } from './responses';
import { injectUser, injectGuild } from './middleware';
import { IMarriage } from '../models/marriage/types';

const { BOT_PREFIX } = process.env;

const getMarriedMember = async (marriage: IMarriage, context: ICommandContext): Promise<GuildMember> => {
  if (!marriage) return null;
  const { message, user } = context;
  const marriedToId = marriage.husband.equals(user._id) ? marriage.wife : marriage.husband;
  const marriedTo = await User.findById(marriedToId);
  return message.guild.fetchMember((marriedTo as any).discordId);
};

const handler: ICommandHandler = async (context): Promise<any> => {
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

    const [characterStats, marriage] = await Promise.all([
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
      Marriage.findOne({
        guild: guild._id,
        status: MarriageStatus.MARRIED,
        $or: [
          { husband: user._id },
          { wife: user._id },
        ],
      }),
    ]);
    const marriedMember = await getMarriedMember(marriage, context);
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
        ...(marriage ? [{
          name: 'Married for',
          value: formatDistance(new Date(), marriage.marriedAt),
        }] : []),
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
    return ErrorResponse('Couldn\'t display profile', context);
  }
};

export default (): ICommand => ({
  middleware: [injectUser(), injectGuild()],
  handler,
  triggers: COMMAND_TRIGGERS.PROFILE,
  description: 'Profile of the mentioned user',
});
