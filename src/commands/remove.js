const User = require('../models/user');
const { getOrCreateUser, userHasImage } = require('./middleware');
const { formatDescription } = require('../util');

const middleware = [getOrCreateUser(), userHasImage('ref')];
const parameters = [
  {
    name: 'ref',
    description: 'reference name',
  },
];
const commandName = 'remove';

module.exports = () => ({
  parameters,
  middleware,
  handler: User.removeImageLink.bind(User),
  triggers: [commandName],
  description: formatDescription({
    commandName,
    description: 'Removes an image',
    usage: '<name>',
  }),
});
