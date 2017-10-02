import { expectUser, expectUserToHaveImage } from './middleware';
import { ref } from '../util/parameters';

export const middleware = [expectUser(), expectUserToHaveImage('ref')];

export const handler = async ({ message, image }) => {
  try {
    await message.delete();
  } catch (err) {
    await message.reply(err.message);
  }

  const msg = `Author: ${message.author.username}#${message.author.discriminator}`;
  const options = { files: [image.url] };

  return message.channel.send(msg, options);
};

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['post', 'p'],
  description: 'Posts an image',
});
