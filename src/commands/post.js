const { getOrCreateUser, userHasImage } = require('./middleware');

const middleware = [getOrCreateUser(), userHasImage('ref')];

const parameters = [
  {
    name: 'ref',
    description: 'reference name',
  },
];

const handler = async context => context.message.channel.send('', { file: context.image.url });

module.exports = () => ({
  parameters,
  middleware,
  handler,
  triggers: ['post'],
  description: 'Posts a referenced image',
});
