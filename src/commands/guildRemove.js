import { Guild } from '../models';
import {
  injectUser,
  injectGuild,
  expectGuildToHaveImage,
  ensureGuildImageAccess,
} from './middleware';
import { ref } from '../util/parameters';

export const middleware = [
  injectUser(),
  injectGuild(),
  expectGuildToHaveImage(),
  ensureGuildImageAccess(),
];

export const handler = Guild.removeImageLink.bind(Guild);

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: ['gremove', 'gr'],
  description: 'Removes an image from the guild',
});
