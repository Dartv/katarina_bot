import {
  Command,
  ParameterDefinition,
  MarkdownFormatter,
  ParameterType,
  TypeResolver,
  CommandObject,
} from 'diskat';
import { MessageEmbed, Constants } from 'discord.js';
import Fuse from 'fuse.js';

import type { Context } from '../../types';
import { Trigger, CommandGroupName } from '../../utils/constants';
import { getExamplesByCommand } from '../../utils/examples';

interface HelpCommandContext extends Context {
  args: {
    command: CommandObject<HelpCommandContext, unknown>;
  };
}

const formatParameter = (parameter: ParameterDefinition): string => {
  const text = `<${parameter.description || parameter.name}>`;

  return text.replace(text, parameter.optional ? `[${text}]` : text);
};

const formatDescription = (
  command: CommandObject<HelpCommandContext, unknown>,
  context: HelpCommandContext,
): string => {
  const {
    formatter,
    client: {
      dispatcher: {
        prefix,
      },
    },
  } = context;
  const { name, parameters = [] } = command;
  const description: string[] = [];
  const examples = getExamplesByCommand(name, context.client);

  if (parameters.length) {
    const usage = parameters.map(formatParameter).join(' ');
    description.push(`Usage: ${formatter.codeBlock(`${prefix}${command.name} ${usage}`)}`);
  }

  if (examples.length) {
    const example = examples.map((body) => `${prefix}${command.name} ${body}`).join('\n');
    description.push(`Example: ${formatter.codeBlock(example)}`);
  }

  return description.join('\n');
};

const HelpCommand: Command<HelpCommandContext, MessageEmbed> = async (context) => {
  const {
    formatter,
    client,
    args,
  } = context;
  const { dispatcher: { prefix } } = client;

  if (args.command) {
    const embed = new MessageEmbed({
      title: args.command.description || args.command.name,
      description: formatDescription(args.command, context),
      color: Constants.Colors.BLUE,
    });
    return embed;
  }

  const embed = new MessageEmbed({
    title: 'List of Commands',
    color: Constants.Colors.BLUE,
  });

  client.commands.groups.forEach((group) => {
    const cmds = group.commands.map(
      ({ name, description }) => `${formatter.bold(`${prefix}${name}:`)} ${description}`,
    ).join(', ');
    embed.addField(
      formatter.underline(group.name),
      cmds,
    );
  });

  return embed;
};

HelpCommand.config = {
  triggers: Trigger.HELP,
  description: 'Help',
  group: CommandGroupName.UTILITY,
  parameters: [
    {
      name: 'command',
      description: 'command name',
      type: TypeResolver.catch(
        async (value: string, message, client) => {
          const fuse = new Fuse(Array.from(client.commands.values()), {
            keys: ['name'],
          });
          const [match] = fuse.search(value);

          if (match) {
            const { item: { name } } = match;
            await message.reply(
              `command ${MarkdownFormatter.code(value)} doesn't exist. Did you mean ${MarkdownFormatter.code(name)}?`
            );
          }

          return null;
        },
        ParameterType.COMMAND,
      ),
      optional: true,
    },
  ],
};

export default HelpCommand;
