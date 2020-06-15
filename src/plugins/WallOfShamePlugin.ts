import { Client } from 'ghastly';
import { MessageReaction } from 'discord.js';
import { Emoji } from '../util';
import { WallOfShame } from '../models';

export const WallOfShamePlugin = (client: Client) => {
  client.on('messageReactionAdd', async (reaction: MessageReaction) => {
    try {
      if (reaction.emoji.name === 'WeirdChamp' && reaction.count >= 5) {
        if (![client.user.id, process.env.SUPER_ADMIN_ID].includes(reaction.message.author.id)) {
          const {
            message,
            message: {
              content,
              author,
              guild,
            },
          } = reaction;
          await message.delete();
          await message.channel.send(
            `Message from ${message.member.displayName} was deleted by voting ${Emoji.COOL_CHAMP}`
          );
          if (content) {
            await WallOfShame.create({
              guild: guild.id,
              user: author.id,
              content,
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
};
