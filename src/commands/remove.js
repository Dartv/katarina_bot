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

module.exports = () => ({
  parameters,
  middleware,
  handler: User.removeImageLink.bind(User),
  triggers: ['remove'],
  description: formatDescription('remove', 'Removes an image', '<name>'),
});
