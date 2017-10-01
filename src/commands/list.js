const R = require('ramda');
const { getOrCreateUser } = require('./middleware');
const props = require('../util/props');

const middleware = [getOrCreateUser()];

const listRefs = R.ifElse(
  R.length,
  R.compose(
    R.join(', '),
    R.map(props.ref)
  ),
  R.always('nothing!'),
);

const handler = async context => context.message.reply(listRefs(context.user.images));

module.exports = () => ({
  middleware,
  handler,
  triggers: ['list', 'l'],
  description: 'Lists all available images',
});
