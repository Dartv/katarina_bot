import { User } from '../models';
import { injectUser, expectUserToHaveImage } from './middleware';
import { ref } from '../util/parameters';

export const middleware = [injectUser(), expectUserToHaveImage('ref')];

export const handler = User.removeImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['remove', 'r'],
  description: 'Removes an image',
});
