import { RichEmbed } from 'discord.js';

import { COLOR_INFO } from '../util/constants';
import { formatDescription } from '../util';
import { joinWithArray } from '../util/helpers';

export const handler = async ({ commands }) => {
  const embed = new RichEmbed({ title: 'COMMANDS LIST' });

  embed.setColor(COLOR_INFO);

  const keys = Array.from(commands.commands.keys());

  keys.forEach((key) => {
    const { name, description, aliases, parameters } = commands.get(key);
    embed.addField(
      joinWithArray(name, aliases),
      formatDescription({ parameters, description, commandName: name })
    );
  });

  return embed;
};

export default () => ({
  handler,
  triggers: ['help'],
  description: 'Prints all available commands',
});
