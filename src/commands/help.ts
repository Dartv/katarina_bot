import { RichEmbed } from 'discord.js';
import { ICommandHandler, ICommand } from 'ghastly';

import { COLORS, COMMAND_TRIGGERS } from '../util/constants';
import { formatDescription } from '../util';
import { joinWithArray } from '../util/helpers';

export const handler: ICommandHandler = async ({ commands, message }) => {
  const embeds = [new RichEmbed()];
  let idx = 0;

  embeds[idx].setColor(COLORS.INFO).setTitle('COMMAND LIST');

  const keys = Array.from(commands.commands.keys());

  keys.forEach((key) => {
    if (key !== 'help') {
      const {
        name,
        description,
        aliases,
        parameters,
      } = commands.get(key);

      if (embeds[idx].fields.length === 25) {
        idx += 1;
        embeds.push(new RichEmbed());
        embeds[idx].setColor(COLORS.INFO).setTitle('COMMAND LIST');
      }

      embeds[idx].addField(
        joinWithArray(name, aliases),
        formatDescription({ parameters, description, commandName: name })
      );
    }
  });

  await Promise.all(embeds.map(embed => message.author.send(embed)));
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.HELP,
  description: 'Prints all available commands',
});
