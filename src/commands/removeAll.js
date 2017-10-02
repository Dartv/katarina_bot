import User from '../models/user';
import { expectUser } from './middleware';

export const middleware = [expectUser()];

export const handler = User.removeAllImageLinks.bind(User);

export default () => ({
  middleware,
  handler,
  triggers: ['removeall', 'ra'],
  description: 'Removes all images',
});
