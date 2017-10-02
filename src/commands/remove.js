import User from '../models/user';
import { expectUser, expectUserToHaveImage } from './middleware';
import { ref } from '../util/parameters';

export const middleware = [expectUser(), expectUserToHaveImage('ref')];

export const handler = User.removeImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['remove', 'r'],
  description: 'Removes an image',
});
