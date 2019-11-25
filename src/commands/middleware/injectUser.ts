import { User } from '../../models';
import { ErrorResponse } from '../responses';
import { Middleware } from '../../types';

export default (): Middleware => async (next, context) => {
  const { message: { author: { id: discordId } } } = context;
  try {
    let user = await User.findOneByDiscordId(discordId);

    if (!user) user = await new User({ discordId }).save();

    return next({ ...context, user });
  } catch (err) {
    return ErrorResponse(err.message, context);
  }
};
