import { injectUser, expectUserToHaveImage } from './middleware';
import { ref, content } from '../util/parameters';
import { ImageResponse, FileResponse } from './responses';
import { concurrentlyD } from '../util/handlers';

export const middleware = [injectUser(), expectUserToHaveImage('ref')];

export const postMessage = async ({ args: { content: msg }, image }) => {
  if (msg) return new ImageResponse(image.url, msg.join(' '));

  return new FileResponse('', [image.url]);
};

export const handler = concurrentlyD([postMessage]);

export default () => ({
  middleware,
  handler,
  parameters: [ref, content],
  triggers: ['post', 'p'],
  description: 'Posts an image from the user\'s images',
});
