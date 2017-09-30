const { RichEmbed } = require('discord.js');

const { COLOR_INFO } = require('../util/constants');

const handler = async ({ commands }) => {
  const embed = new RichEmbed({ title: 'COMMANDS LIST' });

  embed.setColor(COLOR_INFO);

  const keys = Array.from(commands.commands.keys());

  keys.forEach((key) => {
    const { name, description } = commands.get(key);
    embed.addField(name, description);
  });

  return embed;
};

module.exports = () => ({
  handler,
  triggers: ['help'],
  description: 'Prints all available commands',
});
