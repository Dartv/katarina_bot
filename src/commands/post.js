import R from 'ramda';

import { expectUser, expectUserToHaveImage } from './middleware';
import { ref, content } from '../util/parameters';
import { FileResponse } from './responses';

export const middleware = [expectUser(), expectUserToHaveImage('ref')];

export const handler = async ({ args, message, image }) => {
  try {
    await message.delete();
  } catch (err) {
    await message.reply(err.message);
  }

  const responseContent = R.when(
    R.identity,
    R.compose(
      R.join(' '),
      R.prepend(`Author: ${message.author.username}#${message.author.discriminator}`),
      R.prepend('\n'),
    ),
    args.content
  );

  return new FileResponse(responseContent, [image.url]);
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
