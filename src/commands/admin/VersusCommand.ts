import { Command } from 'diskat';
import { TextChannel } from 'discord.js';

import { Context } from '../../types';
import {
  CommandGroupName,
  Trigger,
  ParameterType,
  ChannelName,
} from '../../utils/constants';
import { expectOwner } from '../middleware/expectOwner';
import { Character } from '../../models';
import {
  getPopularityRangeByStarRating,
  adjustStars,
  createCharacterEmbed,
  getCharacterStarRating,
} from '../../utils/character';
import { isTextChannel } from '../../utils/discord-common';
import { ErrorResponse } from '../responses';

interface VersusCommandContext extends Context {
  args: {
    stars: number;
  };
}

export const VersusCommand: Command<VersusCommandContext> = async (context): Promise<any> => {
  const {
    args: { stars },
    client,
  } = context;
  const [$gte, $lte] = getPopularityRangeByStarRating(adjustStars(stars));
  const characters = await Character.random(2, [
    {
      $match: {
        popularity: {
          $lte,
          $gte,
        },
      },
    },
  ]);

  if (!characters.length) {
    return new ErrorResponse(context, 'No characters found');
  }

  const channels = client.channels.cache.filter(
    (channel) => isTextChannel(channel) && channel.name.startsWith(ChannelName.WAIFU_WARS)
  );
  await Promise.all(channels.map(async (channel: TextChannel) => {
    try {
      await channel.send('Who is a better waifu?');
      const messages = await Promise.all(
        characters.map((character) => {
          const embed = createCharacterEmbed({
            ...character.toObject(),
            stars: getCharacterStarRating(character.popularity),
          });
          return channel.send('', { embed });
        })
      );
      await Promise.all(messages.map(msg => msg.react('❤️')));
    } catch (err) {
      client.logger.error(`Not able to start waifu wars for guild ${channel.guild.id}`, err);
    }
  }));

  return null;
};

VersusCommand.config = {
  triggers: Trigger.VERSUS,
  description: 'Start new round of waifu wars',
  group: CommandGroupName.ADMIN,
  middleware: [
    expectOwner(),
  ],
  parameters: [
    {
      name: 'stars',
      type: ParameterType.NUMBER,
      defaultValue: 5,
      optional: true,
    },
  ],
};

export default VersusCommand;
