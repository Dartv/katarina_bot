module.exports = function findOneByDiscordId(discordId) {
  return this.findOne({ discordId });
};
