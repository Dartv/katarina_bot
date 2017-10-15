import { User } from '../models';
import { injectUser } from './middleware';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectUser()];

export const handler = User.removeAllImageLinks.bind(User);

export default () => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.REMOVE_ALL,
  description: 'Removes all user\'s images',
});
