import R from 'ramda';
import { Response } from 'ghastly/command';
import { RichEmbed, Attachment, Message } from 'discord.js';

import { Color } from '../../util/constants';

export class ImageResponse extends Response {
  constructor(image, content, { message }) {
    super(async (): Promise<Message> => {
      const embed = new RichEmbed();

      if (image instanceof Attachment) {
        embed.attachFile(image).setImage(`attachment://${image.name}`);
      } else {
        embed.setImage(image);
      }

      embed
        .setColor(Color.INFO)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setDescription(content);

      return message.channel.send({ embed });
    });
  }
}

export default R.construct(ImageResponse);
