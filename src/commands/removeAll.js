import { User } from '../models';
import { injectUser } from './middleware';

export const middleware = [injectUser()];

export const handler = User.removeAllImageLinks.bind(User);

export default () => ({
  middleware,
  handler,
  triggers: ['removeall', 'ra'],
  description: 'Removes all images',
});
