import { injectGuild, injectUser, expectGuildToHaveImage } from './middleware';
import { ref, content } from '../util/parameters';
import { handler } from './post';

export const middleware = [injectGuild(), injectUser(), expectGuildToHaveImage('ref')];

export default () => ({
  middleware,
  handler,
  parameters: [ref, content],
  triggers: ['gpost', 'gp'],
  description: 'Posts an image from this guild\'s images',
});
