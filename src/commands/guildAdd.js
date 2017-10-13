import R from 'ramda';

import { Guild } from '../models';
import {
  injectUser,
  expectValidUrl,
  expectValidImageUrl,
  expectRefToBeUnique,
  checkAttachment,
  injectGuild,
} from './middleware';
import { ref, url } from '../util/parameters';
import { lenses } from '../util';

export const middleware = [
  injectGuild(),
  injectUser(),
  checkAttachment(),
  expectValidUrl(),
  expectValidImageUrl(),
  expectRefToBeUnique(R.view(lenses.guild.images)),
];

export const handler = Guild.addImageLink.bind(Guild);

export default () => ({
  middleware,
  handler,
  parameters: [ref, {
    ...url,
    optional: true,
    defaultValue: '',
  }],
  triggers: ['gadd', 'ga'],
  description: 'Adds an image link for the guild',
});
