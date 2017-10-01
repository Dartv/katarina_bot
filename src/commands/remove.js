const User = require('../models/user');
const { getOrCreateUser, userHasImage } = require('./middleware');
const { ref } = require('../util/parameters');

const middleware = [getOrCreateUser(), userHasImage('ref')];

module.exports = () => ({
  middleware,
  parameters: [ref],
  handler: User.removeImageLink.bind(User),
  triggers: ['remove'],
  description: 'Removes an image',
});
