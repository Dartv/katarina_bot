import { Guild } from '../../models';
import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  const { message: { guild: { id: discordId } } } = context;
  let guild = await Guild.findOneByDiscordId(discordId);

  if (!guild) {
    try {
      guild = await new Guild({ discordId }).save();
    } catch (err) {
      return ErrorResponse(err.message, context);
    }
  }

  return next({ ...context, guild });
};
