import { InjectUserMiddleware } from '../../types';
import { User } from '../../models';

export const injectUser: InjectUserMiddleware = (config) => async (next, context) => {
  let { message: { author } } = context;

  if (config) {
    ({ user: author } = await config(context));
  }

  const user = await User.findOneAndUpdate({ discordId: author.id }, {
    $set: {
      discordId: author.id,
      username: author.username,
      discriminator: author.discriminator,
    },
  }, { upsert: true });

  return next({ ...context, user });
};
