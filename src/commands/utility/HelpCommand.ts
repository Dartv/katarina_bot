import {
  Command,
  ParameterDefinition,
  MarkdownFormatter,
  TypeResolver,
  CommandObject,
  TypeResolverContext,
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

const HelpCommand: Command<HelpCommandContext> = async (context) => {
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

  const embedDescription = [
    'Almost every command has subcommands and options.\n'
    + `Type ${formatter.code(`${prefix}${Trigger.HELP[0]} <command name>`)} to get more details.`,
    '\n\n',
    formatter.bold('Quickstart:'),
    formatter.codeBlock(`
${prefix}${Trigger.DAILY[0]}
${prefix}${Trigger.ROLL[0]}
${prefix}${Trigger.PROFILE[0]}
    `.trim()),
  ].join('');
  const embed = new MessageEmbed({
    title: 'List of Commands',
    description: embedDescription,
    color: Constants.Colors.BLUE,
  });

  Object
    .values(CommandGroupName)
    .filter(groupName => ![CommandGroupName.ADMIN].includes(groupName))
    .forEach((groupName) => {
      const group = client.commands.groups.get(groupName);
      const cmds = group.commands
        .filter(({ name }) => name !== context.command.name)
        .map(
          ({ name, description }) => `${formatter.bold(`${prefix}${name}:`)} ${description}`,
        )
        .join('\n');
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
      type: TypeResolver.catch<TypeResolverContext<string>>(
        async ({ value, message, client }) => {
          const fuse = new Fuse(Array.from(client.commands.values()), {
            keys: ['name'],
          });
          const [match] = fuse.search(value);

          if (match) {
            const { item: { name } } = match;
            await message.reply(
              `Command ${MarkdownFormatter.code(value)} doesn't exist. Did you mean ${MarkdownFormatter.code(name)}?`
            );
          }

          return null;
        },
        TypeResolver.Types.COMMAND,
      ),
      optional: true,
    },
  ],
};

export default HelpCommand;
