const { RichEmbed } = require('discord.js');

const handler = async ({ commands }) => {
  const embed = new RichEmbed({ title: 'Commands list' });

  embed.setColor('#b8daff');

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
