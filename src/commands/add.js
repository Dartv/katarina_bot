import { User } from '../models';
import {
  injectUser,
  expectValidUrl,
  expectValidImageUrl,
  expectRefToBeUnique,
  checkAttachment,
} from './middleware';
import { ref, url } from '../util/parameters';

export const middleware = [
  injectUser(),
  checkAttachment(),
  expectValidUrl('url'),
  expectValidImageUrl('url'),
  expectRefToBeUnique('ref', ['user', 'images']),
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
  description: 'Adds an image link for the user',
});
