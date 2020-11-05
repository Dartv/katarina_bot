import { Command } from 'diskat';

import { Context } from '../../types';
import {
  CommandGroupName,
  Trigger,
  ParameterType,
  GuildSetting,
} from '../../utils/constants';
import { expectOwner } from '../middleware/expectOwner';
import { Character, Guild } from '../../models';
import {
  getPopularityRangeByStarRating,
  adjustStars,
  createCharacterEmbed,
  getCharacterStarRating,
} from '../../utils/character';
import { isTextChannel } from '../../utils/discord-common';
import { ErrorResponse } from '../responses';

export interface VersusCommandContext extends Context {
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

  if (characters.length < 2) {
    return new ErrorResponse(context, 'No characters found');
  }

  const cursor = Guild.find(
    { [`settings.${GuildSetting.WARS_CHANNEL}`]: { $ne: null } },
    { _id: 1, [`settings.${GuildSetting.WARS_CHANNEL}`]: 1 },
  ).cursor();

  await cursor.eachAsync(async (guild) => {
    const channel = client.channels.cache.get(guild.settings.warsChannel);
    if (isTextChannel(channel)) {
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
        client.logger.error(`Not able to start waifu wars for guild ${channel.guild.id}`);
        client.logger.error(err);
      }
    }
  });

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
