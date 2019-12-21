export default async function findOneByDiscordId(discordId) {
  return this.findOne({ discordId }).populate({
    path: 'waifu',
    populate: {
      path: 'series',
    },
  });
}
