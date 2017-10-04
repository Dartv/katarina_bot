import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLOR_INFO } from '../../util/constants';

export default class TextResponse extends Response {
  constructor(title, content) {
    super(async ({ message }) => {
      const embed = new RichEmbed();
      embed
        .setColor(COLOR_INFO)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTitle(title)
        .setDescription(content);

      return message.channel.send({ embed });
    });
  }
}
