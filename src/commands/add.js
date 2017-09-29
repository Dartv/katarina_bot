const User = require('../models/user');
const { getOrCreateUser, isValidUrl, isValidImageUrl, isRefAlreadyInUse } = require('./middleware');

const middleware = [getOrCreateUser(), isValidUrl('url'), isValidImageUrl('url'), isRefAlreadyInUse('ref')];

const parameters = [
  {
    name: 'ref',
    description: 'reference name',
  },
  {
    name: 'url',
    description: 'image url',
  },
];

module.exports = () => ({
  parameters,
  middleware,
  handler: User.addImageLink.bind(User),
  triggers: ['add'],
  description: 'Adds an image reference link to the current user links',
});
