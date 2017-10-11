import fs from 'mz/fs';

import { FileResponse } from './responses';

const path = process.env.IMAGE_ART_DIR;

export const handler = async (context) => {
  const images = await fs.readdir(path);
  const image = images[Math.floor(Math.random() * images.length)];
  return FileResponse('', [`${path}/${image}`], context);
};

export default () => ({
  handler,
  triggers: ['art'],
  description: 'Posts a random anime girl',
});
