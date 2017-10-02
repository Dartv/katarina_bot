import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLOR_ERROR } from '../../util/constants';

export default class ErrorResponse extends Response {
  constructor(error) {
    super(async ({ message }) => {
      const embed = new RichEmbed();
      embed
        .setColor(COLOR_ERROR)
        .setTitle('🚫 Something went wrong!')
        .setDescription(error);
      return message.channel.send({ embed });
    });
  }
}
