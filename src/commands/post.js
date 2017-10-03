import { expectUser, expectUserToHaveImage } from './middleware';
import { ref, content } from '../util/parameters';
import { ImageResponse, ErrorResponse, FileResponse } from './responses';
import { handleAll, deleteMessage } from '../util/handlers';

export const middleware = [expectUser(), expectUserToHaveImage('ref')];

export const postMessage = async ({ args, image }) => {
  if (args.content) return new ImageResponse(image.url, args.content.join(' '));

  return new FileResponse('', [image.url]);
};

export const handler = async (context) => {
  try {
    const [, res] = await handleAll([
      deleteMessage,
      postMessage,
    ], context);
    return res;
  } catch (err) {
    return ErrorResponse(err.message);
  }
};

export default () => ({
  middleware,
  handler,
  parameters: [ref, {
    ...content,
    optional: true,
    repeatable: true,
    defaultValue: '',
  }],
  triggers: ['post', 'p'],
  description: 'Posts an image',
});
