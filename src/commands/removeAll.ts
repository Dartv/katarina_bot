import { User } from '../models';
import { injectUser, deleteMessage } from './middleware';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectUser(), deleteMessage()];

export const handler = (User as any).removeAllImageLinks.bind(User);

export default () => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.REMOVE_ALL,
  description: 'Removes all user\'s images',
});
