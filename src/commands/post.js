const { getOrCreateUser, userHasImage } = require('./middleware');
const { ref } = require('../util/parameters');

const middleware = [getOrCreateUser(), userHasImage('ref')];

const handler = async context => context.message.channel.send('', { file: context.image.url });

module.exports = () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['post', 'p'],
  description: 'Posts an image',
});
