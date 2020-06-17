import { Guild } from '../../models';
import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  const { message: { guild: { id: discordId } } } = context;

  try {
    let guild = await Guild.findOneByDiscordId(discordId);

    if (!guild) guild = await new Guild({ discordId }).save();

    return next({ ...context, guild });
  } catch (err) {
    return ErrorResponse(err.message, context);
  }
};
