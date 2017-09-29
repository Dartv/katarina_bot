const { getOrCreateUser, userHasImage } = require('./middleware');

const middleware = [getOrCreateUser(), userHasImage('ref')];

const parameters = [
  {
    name: 'ref',
    description: 'reference name',
  },
  {
    name: 'asUrl',
    description: 'post as url',
    optional: true,
    defaultValue: false,
  },
];

const handler = async context => context.args.asUrl
    ? context.image.url
    : context.message.channel.send('', { file: context.image.url });

module.exports = () => ({
  parameters,
  middleware,
  handler,
  triggers: ['post'],
  description: 'Posts a referenced image',
});
