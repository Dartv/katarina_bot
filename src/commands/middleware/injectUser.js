import { User } from '../../models';
import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  const { message: { author: { id: discordId } } } = context;
  let user = await User.findOneByDiscordId(discordId);

  if (user) return next({ ...context, user });

  try {
    user = await new User({ discordId }).save();
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return next({ ...context, user });
};
