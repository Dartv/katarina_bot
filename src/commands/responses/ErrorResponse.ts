import R from 'ramda';
import { Response } from 'ghastly/command';
import { RichEmbed } from 'discord.js';

import { COLORS } from '../../util/constants';

const DEFAULT_ERROR_MESSAGE = 'Ooops... Something went wrong!';

export class ErrorResponse extends Response {
  constructor(error, { message, formatter: { code } }) {
    super(async () => {
      const embed = new RichEmbed();
      embed
        .setColor(COLORS.ERROR)
        .setAuthor(message.author.username, message.author.avatarURL)
        .addField('💬 INPUT', code(message.content))
        .addField('🚫 ERROR', error || DEFAULT_ERROR_MESSAGE);
      return message.channel.send({ embed });
    });
  }
}

export default R.construct(ErrorResponse);
