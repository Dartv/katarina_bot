import { Guild } from '../models';
import {
  injectUser,
  injectGuild,
  expectGuildToHaveImage,
  ensureGuildImageAccess,
  deleteMessage,
} from './middleware';
import { ref } from '../util/parameters';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [
  injectUser(),
  injectGuild(),
  expectGuildToHaveImage(),
  ensureGuildImageAccess(),
  deleteMessage(),
];

export const handler = (Guild as any).removeImageLink.bind(Guild);

export default () => ({
  middleware,
  handler,
  parameters: [ref],
  triggers: COMMAND_TRIGGERS.GUILD_REMOVE,
  description: 'Removes an image from the guild',
});
