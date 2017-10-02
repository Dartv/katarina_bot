import User from '../models/user';
import { getOrCreateUser } from './middleware';

export const middleware = [getOrCreateUser()];

export const handler = User.removeAllImageLinks.bind(User);

export default () => ({
  middleware,
  handler,
  triggers: ['removeall', 'ra'],
  description: 'Removes all images',
});
