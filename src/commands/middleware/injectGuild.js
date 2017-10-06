import { Guild } from '../../models';
import { dispatchError } from '../../util/helpers';

export default () => async (next, context) => {
  const { message: { guild: { id: discordId } } } = context;
  let guild = await Guild.findOneByDiscordId(discordId);

  if (!guild) {
    try {
      guild = await new Guild({ discordId }).save();
    } catch (err) {
      return dispatchError(err.message, context);
    }
  }

  return next({ ...context, guild });
};
