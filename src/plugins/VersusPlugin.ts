import { User as DiscordUser } from 'discord.js';

import { Plugin } from '../types';
import { isTextChannel } from '../utils/discord-common';
import { ChannelName, MissionCode, Trigger } from '../utils/constants';
import { User } from '../models';

export const VersusPlugin: Plugin = (client) => {
  client.on('messageReactionAdd', async (reaction, author) => {
    const { message } = reaction;
    const { channel } = message;
    if (isTextChannel(channel) && channel.name === ChannelName.WAIFU_WARS && reaction.emoji.name === '❤️') {
      const user = await User.findOne({ discordId: author.id });
      if (user) {
        message.author = author as DiscordUser;
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
  });
};
