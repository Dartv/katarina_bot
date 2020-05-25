import R from 'ramda';
import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { Color } from '../../util/constants';

export class SuccessResponse extends Response {
  constructor(title, description, { message }) {
    super(async () => {
      const embed = new RichEmbed();
      embed
        .setColor(Color.SUCCESS)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTitle(`✅ ${title}`)
        .setDescription(description);
      return message.channel.send({ embed });
    });
  }
}

export default R.construct(SuccessResponse);
