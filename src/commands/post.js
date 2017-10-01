const { getOrCreateUser, userHasImage } = require('./middleware');
const { ref } = require('../util/parameters');

const middleware = [getOrCreateUser(), userHasImage('ref')];

const handler = async ({ message, image }) => {
  try {
    await message.delete();
  } catch (err) {
    await message.reply(err.message);
  }

  const msg = `Author: ${message.author.username}#${message.author.discriminator}`;
  const options = { files: [image.url] };

  return message.channel.send(msg, options);
};

module.exports = () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['post', 'p'],
  description: 'Posts an image',
});
