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
import * as params from '../util/parameters';
import { lenses } from '../util';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [
  injectGuild(),
  injectUser(),
  checkAttachment(),
  expectValidUrl(),
  expectValidImageUrl(),
  expectRefToBeUnique(R.view(lenses.guild.images as any)),
];

export const handler = (Guild as any).addImageLink.bind(Guild);

export default () => ({
  middleware,
  handler,
  parameters: [params.ref, {
    ...params.url,
    optional: true,
    defaultValue: '',
  }],
  triggers: COMMAND_TRIGGERS.GUILD_ADD,
  description: 'Adds an image link for the guild',
});
