import R from 'ramda';

import { User } from '../models';
import {
  injectUser,
  expectValidUrl,
  expectValidImageUrl,
  expectRefToBeUnique,
  checkAttachment,
} from './middleware';
import * as params from '../util/parameters';
import { lenses } from '../util';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [
  injectUser(),
  checkAttachment(),
  expectValidUrl(),
  expectValidImageUrl(),
  expectRefToBeUnique(R.view(lenses.user.images)),
];

export const handler = User.addImageLink.bind(User);

export default () => ({
  middleware,
  handler,
  parameters: [params.ref, {
    ...params.url,
    optional: true,
    defaultValue: '',
  }],
  triggers: COMMAND_TRIGGERS.ADD,
  description: 'Adds an image link for the user',
});
