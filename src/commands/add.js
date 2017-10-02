import User from '../models/user';
import { expectUser, expectValidUrl, expectValidImageUrl, expectRefToBeUnique } from './middleware';
import { ref, url } from '../util/parameters';

export const middleware = [
  expectUser(),
  expectValidUrl('url'),
  expectValidImageUrl('url'),
  expectRefToBeUnique('ref'),
];

export const handler = User.addImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref, url],
  triggers: ['add', 'a'],
  description: 'Adds an image link',
});
