import { InjectUserMiddleware } from '../../types';
import { User } from '../../models';

export const injectUser: InjectUserMiddleware = (config) => async (next, context) => {
  let { message: { author } } = context;

  if (config) {
    ({ user: author } = await config(context));
  }

  let user = await User.findOne({ discordId: author.id });

  if (!user) {
    user = await new User({
      discordId: author.id,
      username: author.username,
      discriminator: author.discriminator,
    }).save();
  }

  return next({ ...context, user });
};
