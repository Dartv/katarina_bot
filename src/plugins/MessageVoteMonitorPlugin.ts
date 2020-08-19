import { Plugin } from '../types';
import { TEST_GUILD_IDS, Emoji } from '../utils/constants';

export const MessageVoteMonitorPlugin: Plugin = (client) => {
  client.on('messageReactionAdd', async (reaction) => {
    try {
      if (reaction
        && TEST_GUILD_IDS.includes(reaction.message.guild.id)
        && reaction.emoji.name === 'WeirdChamp'
        && reaction.count >= 5) {
        if (![client.user.id, ...process.env.OWNERS.split(',')].includes(reaction.message.author.id)) {
          const { message } = reaction;
          await message.delete();
          await message.channel.send(
            `Message from ${message.member.displayName} was deleted by voting ${Emoji.COOL_CHAMP}`
          );
        }
      }
    } catch (err) {
      client.emit('error', err);
    }
  });
};
