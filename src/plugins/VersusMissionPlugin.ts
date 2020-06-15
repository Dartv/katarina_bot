import { Client } from 'ghastly';
import { TextChannel } from 'discord.js';

import { withMission } from '../commands/middleware';
import { MissionCode, RewardTable } from '../util';
import { IMission } from '../models/mission/types';
import { getDailyResetDate } from '../util/daily';
import { User } from '../models';
import { createContext } from '../util/command';

const CHANNEL_NAME = 'waifu-wars👊';

export const VersusMissionPlugin = async (client: Client): Promise<void> => {
  const middleware = withMission(async () => ({
    silent: true,
    code: MissionCode.VERSUS_DAILY,
    reward: RewardTable.VERSUS_DAILY,
    update: async (mission): Promise<IMission> => {
      Object.assign(mission, {
        resetsAt: getDailyResetDate(),
        completedAt: new Date(),
      });
      return mission;
    },
  }));

  client.on('messageReactionAdd', async (reaction, author) => {
    const { message } = reaction;
    const { channel } = message;

    if (channel instanceof TextChannel) {
      if (channel.name === CHANNEL_NAME && reaction.emoji.name === '❤️') {
        const user = await User.findOneByDiscordId(author.id);
        if (user) {
          message.author = author;
          const context = createContext({
            user,
            message,
            client,
          });
          await middleware(() => null, context);
        }
      }
    }
  });
};
