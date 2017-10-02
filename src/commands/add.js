import User from '../models/user';
import { getOrCreateUser, isValidUrl, isValidImageUrl, isRefAlreadyInUse } from './middleware';
import { ref, url } from '../util/parameters';

export const middleware = [
  getOrCreateUser(),
  isValidUrl('url'),
  isValidImageUrl('url'),
  isRefAlreadyInUse('ref'),
];

export const handler = User.addImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref, url],
  triggers: ['add', 'a'],
  description: 'Adds an image link',
});
