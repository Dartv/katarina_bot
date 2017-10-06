import { injectGuild, injectUser, expectGuildToHaveImage } from './middleware';
import { ref, content } from '../util/parameters';
import { handler } from './post';

export const middleware = [injectGuild(), injectUser(), expectGuildToHaveImage('ref')];

export default () => ({
  middleware,
  handler,
  parameters: [ref, content],
  triggers: ['guildpost', 'gp'],
  description: 'Posts an image',
});
