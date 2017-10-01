const User = require('../models/user');
const { getOrCreateUser, isValidUrl, isValidImageUrl, isRefAlreadyInUse } = require('./middleware');
const { ref, url } = require('../util/parameters');

const middleware = [getOrCreateUser(), isValidUrl('url'), isValidImageUrl('url'), isRefAlreadyInUse('ref')];

module.exports = () => ({
  middleware,
  parameters: [ref, url],
  handler: User.addImageLink.bind(User),
  triggers: ['add'],
  description: 'Adds an image link',
});
