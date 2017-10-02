import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLOR_ERROR } from '../../util/constants';

export default class ErrorResponse extends Response {
  constructor(error) {
    super(async ({ message, formatter: { code } }) => {
      const embed = new RichEmbed();
      embed
        .setColor(COLOR_ERROR)
        .setAuthor(message.author.username, message.author.avatarURL)
        .addField('💬 INPUT', code(message.content))
        .addField('🚫 ERROR', error);
      return message.channel.send({ embed });
    });
  }
}
