import { Context, Response } from 'diskat';
import { MessageEmbed, Constants } from 'discord.js';

const DEFAULT_ERROR_MESSAGE = 'Ooops... Something went wrong!';

export class ErrorResponse extends Response {
  constructor({ message, formatter }: Context, error = DEFAULT_ERROR_MESSAGE) {
    super(async () => {
      const embed = new MessageEmbed();
      embed
        .setColor(Constants.Colors.RED)
        .setAuthor(message.author.username, message.author.avatarURL())
        .addField('💬 INPUT', formatter.code(message.content))
        .addField('🚫 ERROR', error);
      return message.channel.send({ embed });
    });
  }
}
