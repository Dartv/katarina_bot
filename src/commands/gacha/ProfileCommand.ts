import { Command } from 'diskat';
import { MessageEmbed, GuildMember, Constants } from 'discord.js';
import { Types } from 'mongoose';

import {
  UserDocument,
  Context,
  CharacterDocument,
  SeriesDocument,
} from '../../types';
import {
  Trigger,
  CommandGroupName,
  ParameterType,
  Emoji,
} from '../../utils/constants';
import { injectUser } from '../middleware';
import { User, UserCharacter } from '../../models';
import { ErrorResponse } from '../responses';
import { getUserCharactersWithStarsPipeline } from '../../utils/character';

export interface ProfileCommandContext extends Context {
  user: UserDocument;
  args: {
    member?: GuildMember;
  };
}

const ProfileCommand: Command<ProfileCommandContext> = async (context): Promise<any> => {
  const {
    message,
    args: { member = message.member },
    client: {
      dispatcher,
    },
    formatter,
  } = context;
  const user = await User.findOne({
    discordId: member.id,
  }).populate({
    path: 'waifu',
    populate: {
      path: 'series',
    },
  });

  if (!user) {
    return new ErrorResponse(context, `User ${member.displayName} not found`);
  }

  const aggregationResult: { stars: number, count: number }[] = await UserCharacter.aggregate([
    {
      $match: {
        user: user._id,
      },
    },
    ...getUserCharactersWithStarsPipeline(),
    {
      $group: {
        _id: '$stars',
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        stars: '$_id',
        count: 1,
      },
    },
  ]);
  const charactersCount = aggregationResult.reduce((acc, { count }) => acc + count, 0);
  const waifu = user.waifu as CharacterDocument;

  const embed = new MessageEmbed()
    .setTitle(`${member.displayName}'s profile`)
    .setDescription(
      user.quote ? `"${user.quote}"` : `Set your quote with ${dispatcher.prefix}${Trigger.SET_QUOTE[0]}`
    )
    .setColor(Constants.Colors.BLUE)
    .setThumbnail(waifu?.imageUrl)
    .addField(formatter.bold('Characters'), charactersCount, true)
    .addField(formatter.bold('Favorites'), user.favorites.length, true)
    .addField(formatter.bold('Characters guessed'), user.correctQuizGuesses, true)
    .addField('Katacoins', `${user.currency} 💎`, true)
    .addField(formatter.bold('Achievements'), 0, true)
    .addField('\u200B', '\u200B', true)
    .addField(
      'Stars',
      aggregationResult.map(({ stars }) => Emoji.STAR_DEFAULT.repeat(stars)).join('\n'),
      true,
    )
    .addField('\u200B', '\u200B', true)
    .addField(
      'Count',
      aggregationResult.map(({ count }) => count).join('\n'),
      true,
    );

  if (user.waifu) {
    embed.addField(formatter.bold('Waifu'), waifu.name);
    if (waifu.series.length) {
      embed.addField(
        formatter.bold('Series'),
        (waifu.series as Types.DocumentArray<SeriesDocument>).map(({ title }) => title).join(', ')
      );
    }
  } else {
    embed.addField(
      formatter.bold('Waifu'),
      `Set your waifu with ${dispatcher.prefix}${Trigger.SET_WAIFU[0]}`
    );
  }

  return embed;
};

ProfileCommand.config = {
  triggers: Trigger.PROFILE,
  description: 'User\'s profile',
  parameters: [
    {
      name: 'member',
      description: 'user',
      optional: true,
      type: ParameterType.MEMBER,
    },
  ],
  middleware: [
    injectUser(),
  ],
  group: CommandGroupName.GACHA,
};

export default ProfileCommand;
