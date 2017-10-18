import R from 'ramda';
import { RichEmbed } from 'discord.js';

import { COLORS, COMMAND_TRIGGERS } from '../util/constants';
import { formatDescription } from '../util';
import { joinWithArray } from '../util/helpers';

export const handler = R.once(async ({ commands }) => {
  const embed = new RichEmbed();

  embed.setColor(COLORS.INFO).setTitle('COMMANDS LIST');

  const keys = Array.from(commands.commands.keys());

  keys.forEach((key) => {
    if (key !== 'help') {
      const { name, description, aliases, parameters } = commands.get(key);
      embed.addField(
        joinWithArray(name, aliases),
        formatDescription({ parameters, description, commandName: name })
      );
    }
  });

  return embed;
});

export default () => ({
  handler,
  triggers: COMMAND_TRIGGERS.HELP,
  description: 'Prints all available commands',
});
