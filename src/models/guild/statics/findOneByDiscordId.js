export default async function findOneByDiscordId(discordId) {
  return this.findOne({ discordId });
}
