export default async function findOneByDiscordId(discordId) {
  return this.findOne({ discordId })
    .populate({
      path: 'waifu',
      populate: {
        path: 'series',
      },
    })
    .populate({
      path: 'deck',
      populate: {
        path: 'series',
      },
    });
}
