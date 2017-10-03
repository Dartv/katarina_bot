import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLOR_INFO } from '../../util/constants';

export default class ImageResponse extends Response {
  constructor(image, content) {
    super(async ({ message }) => {
      const embed = new RichEmbed();
      embed
        .setColor(COLOR_INFO)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setImage(image);

      if (content) embed.setDescription(content);

      return message.channel.send({ embed });
    });
  }
}
