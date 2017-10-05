import User from '../models/user';
import {
  expectUser,
  expectValidUrl,
  expectValidImageUrl,
  expectRefToBeUnique,
  checkAttachment,
} from './middleware';
import { ref, url } from '../util/parameters';

export const middleware = [
  expectUser(),
  checkAttachment(),
  expectValidUrl('url'),
  expectValidImageUrl('url'),
  expectRefToBeUnique('ref'),
];

export const handler = User.addImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [ref, {
    ...url,
    optional: true,
    defaultValue: '',
  }],
  triggers: ['add', 'a'],
  description: 'Adds an image link',
});
