import User from '../models/user';
import { getOrCreateUser, userHasImage } from './middleware';
import { ref } from '../util/parameters';

export const middleware = [getOrCreateUser(), userHasImage('ref')];

export const handler = User.removeImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['remove', 'r'],
  description: 'Removes an image',
});
