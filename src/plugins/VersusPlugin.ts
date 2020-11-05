import { User as DiscordUser } from 'discord.js';

import { MissionEventContext, Plugin } from '../types';
import { MissionCode, Trigger } from '../utils/constants';
import { Guild, User } from '../models';

export const VersusPlugin: Plugin = (client) => {
  client.on('messageReactionAdd', async (reaction, author: DiscordUser) => {
    try {
      const { message } = reaction;
      if (message.guild && reaction.emoji.name === '❤️') {
        const [guild, user] = await Promise.all([
          Guild.findOne({ discordId: message.guild.id }),
          User.register(author),
        ]);

        if (guild && user && guild.settings.warsChannel === message.channel.id) {
          message.author = author;

          const context: MissionEventContext = {
            ...client.dispatcher.createContext({
              command: client.commands.get(Trigger.VERSUS[0]),
              message,
              args: {},
            }),
            user,
            silent: true,
          };

          client.emitter.emit('mission', MissionCode.VERSUS_DAILY, null, context);
        }
      }
    } catch (err) {
      client.logger.error(err);
    }
  });
};
