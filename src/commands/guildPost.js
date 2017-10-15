import { injectGuild, injectUser, expectGuildToHaveImage } from './middleware';
import { ref, content } from '../util/parameters';
import { handler } from './post';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectGuild(), injectUser(), expectGuildToHaveImage()];

export default () => ({
  middleware,
  handler,
  parameters: [ref, content],
  triggers: COMMAND_TRIGGERS.GUILD_POST,
  description: 'Posts an image from this guild\'s images',
});
