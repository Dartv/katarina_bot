import { injectUser, expectUserToHaveImage } from './middleware';
import * as params from '../util/parameters';
import { ImageResponse, FileResponse } from './responses';
import { concurrentlyD } from '../util/handlers';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectUser(), expectUserToHaveImage()];

export const postMessage = async (context) => {
  const { args: { content }, image } = context;
  if (content) return ImageResponse(image.url, content.join(' '), context);
  return FileResponse('', [image.url], context);
};

export const handler = concurrentlyD([postMessage]);

export default () => ({
  middleware,
  handler,
  parameters: [params.ref, params.content],
  triggers: COMMAND_TRIGGERS.POST,
  description: 'Posts an image from the user\'s images',
});
