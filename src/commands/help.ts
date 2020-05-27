import { RichEmbed } from 'discord.js';
import { ICommandHandler, ICommand } from 'ghastly';

import { Color, COMMAND_TRIGGERS } from '../util/constants';
import { formatDescription } from '../util';
import { joinWithArray } from '../util/helpers';

export const handler: ICommandHandler = async (context) => {
  const {
    commands: { commands },
    message,
    args: { commandName },
    formatter,
    client,
  } = context;

  if (commandName) {
    const command = commands.get(commandName);
    if (command) {
      const embed = new RichEmbed({
        title: formatter.bold(command.name),
        description: formatDescription({
          parameters: command.parameters,
          description: command.description,
          commandName: command.name,
        }),
      });
      return embed;
    }
  }

  const embeds = [new RichEmbed()];
  let idx = 0;

  embeds[idx]
    .setDescription(`Type ${client.dispatcher.prefix}help <command> to view certain command's help`)
    .setColor(Color.INFO)
    .setTitle('COMMAND LIST');

  const keys = Array.from(commands.keys());

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
        embeds[idx].setColor(Color.INFO).setTitle('COMMAND LIST');
      }

      embeds[idx].addField(
        joinWithArray(name, aliases),
        formatDescription({ parameters, description, commandName: name })
      );
    }
  });

  await Promise.all(embeds.map(embed => message.author.send(embed)));
  return null;
};

export default (): ICommand => ({
  handler,
  parameters: [
    {
      name: 'commandName',
      description: 'command name',
      optional: true,
      defaultValue: '',
    },
  ],
  triggers: COMMAND_TRIGGERS.HELP,
  description: 'Prints all available commands',
});
