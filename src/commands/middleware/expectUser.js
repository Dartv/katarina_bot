import User from '../../models/user';
import { dispatchError } from '../../util/helpers';

export default () => async (next, context) => {
  const { message: { author: { id: discordId } } } = context;
  let user = await User.findOneByDiscordId(discordId);

  if (user) return next({ ...context, user });

  try {
    user = await new User({ discordId }).save();
  } catch (err) {
    return dispatchError(err.message, context);
  }

  return next({ ...context, user });
};
