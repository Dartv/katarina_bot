import { Guild } from '../../models';
import { injectGuildMiddleware } from '../../types';

export const injectGuild: injectGuildMiddleware = () => async (next, context) => {
  const { message: { guild: { id: discordId } } } = context;

  let guild = await Guild.findOne({ discordId });

  if (!guild) guild = await new Guild({ discordId }).save();

  return next({ ...context, guild });
};
