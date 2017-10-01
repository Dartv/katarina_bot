const { RichEmbed } = require('discord.js');

const { COLOR_INFO } = require('../util/constants');
const { formatDescription } = require('../util');
const { joinWithArray } = require('../util/helpers');

const handler = async ({ commands }) => {
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

module.exports = () => ({
  handler,
  triggers: ['help'],
  description: 'Prints all available commands',
});
