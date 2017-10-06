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

export const middleware = [
  injectGuild(),
  injectUser(),
  checkAttachment(),
  expectValidUrl('url'),
  expectValidImageUrl('url'),
  expectRefToBeUnique('ref', ['guild', 'images']),
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
  triggers: ['guildadd', 'ga'],
  description: 'Adds an image link',
});
