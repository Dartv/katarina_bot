import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLOR_SUCCESS } from '../../util/constants';

export default class ErrorResponse extends Response {
  constructor(description) {
    super(async ({ message }) => {
      const embed = new RichEmbed();
      embed
        .setColor(COLOR_SUCCESS)
        .setTitle('✅ Success!')
        .setDescription(description);
      return message.channel.send({ embed });
    });
  }
}
