import { User } from '../models';
import { injectUser, expectUserToHaveImage } from './middleware';
import { ref } from '../util/parameters';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectUser(), expectUserToHaveImage()];

export const handler = User.removeImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: COMMAND_TRIGGERS.REMOVE,
  description: 'Removes an image from the user',
});
