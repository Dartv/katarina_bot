import { InjectUserMiddleware } from '../../types';
import { User } from '../../models';

export const injectUser: InjectUserMiddleware = (config) => async (next, context) => {
  let { message: { author } } = context;

  if (config) {
    ({ user: author } = await config(context));
  }

  const user = await User.register(author);

  return next({ ...context, user });
};
