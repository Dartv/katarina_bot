import { User as DiscordUser } from 'discord.js';

import { Plugin } from '../types';
import { MissionCode, Trigger } from '../utils/constants';
import { Guild, User } from '../models';

export const VersusPlugin: Plugin = (client) => {
  client.on('messageReactionAdd', async (reaction, author: DiscordUser) => {
    const { message } = reaction;
    if (message.guild && reaction.emoji.name === '❤️') {
      const guild = await Guild.findOne({ _id: message.guild.id });

      if (guild && guild.settings?.warsChannel === message.channel.id) {
        const user = await User.findOne({ discordId: author.id });
        if (user) {
          message.author = author;

          const context = {
            ...client.dispatcher.createContext({
              command: client.commands.get(Trigger.VERSUS[0]),
              message,
              args: {},
            }),
            user,
          };

          client.emitter.emit('mission', MissionCode.VERSUS_DAILY, null, context);
        }
      }
    }
  });
};
