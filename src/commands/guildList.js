import { injectUser, injectGuild } from './middleware';
import { TextResponse } from './responses';
import { listRefs } from './list';
import { COMMAND_TRIGGERS } from '../util/constants';

export const middleware = [injectUser(), injectGuild()];

export const handler = async context =>
  TextResponse('This guild\'s images:', listRefs(context.guild.images), context);

export default () => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.GUILD_LIST,
  description: 'Lists guild\'s images',
});
