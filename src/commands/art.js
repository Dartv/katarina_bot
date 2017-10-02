import fs from 'mz/fs';

const path = process.env.IMAGE_ART_DIR;

export const handler = async (context) => {
  const files = await fs.readdir(path);
  const file = files[Math.floor(Math.random() * files.length)];
  return context.message.channel.send('', { files: [`${path}/${file}`] });
};

export default () => ({
  handler,
  triggers: ['art'],
  description: 'Posts a random anime girl',
});
