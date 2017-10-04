import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLOR_SUCCESS } from '../../util/constants';

export default class ErrorResponse extends Response {
  constructor(title, description = '') {
    super(async ({ message }) => {
      const embed = new RichEmbed();
      embed
        .setColor(COLOR_SUCCESS)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTitle(`✅ ${title}!`)
        .setDescription(description);
      return message.channel.send({ embed });
    });
  }
}
