import fs from 'mz/fs';

import { FileResponse } from './responses';
import { COMMAND_TRIGGERS } from '../util/constants';

const path = process.env.IMAGE_ART_DIR;

export const handler = async (context) => {
  const images = await fs.readdir(path);
  const image = images[Math.floor(Math.random() * images.length)];
  return FileResponse('', [`${path}/${image}`], context);
};

export default () => ({
  handler,
  triggers: COMMAND_TRIGGERS.ART,
  description: 'Posts a random anime girl',
});
