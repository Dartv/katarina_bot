const { getOrCreateUser, userHasImage } = require('./middleware');
const { formatDescription } = require('../util');

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
const commandName = 'post';

const handler = async context => context.args.asUrl
    ? context.image.url
    : context.message.channel.send('', { file: context.image.url });

module.exports = () => ({
  parameters,
  middleware,
  handler,
  triggers: [commandName, 'p'],
  description: formatDescription({
    commandName,
    description: 'Posts an image',
    usage: '<name>',
  }),
});
