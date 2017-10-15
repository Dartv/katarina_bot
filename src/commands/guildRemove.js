import { Guild } from '../models';
import {
  injectUser,
  injectGuild,
  expectGuildToHaveImage,
  ensureGuildImageAccess,
} from './middleware';
import { ref } from '../util/parameters';
import { COMMAND_TRIGGERS } from '../util/constants';

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
  triggers: COMMAND_TRIGGERS.GUILD_REMOVE,
  description: 'Removes an image from the guild',
});
