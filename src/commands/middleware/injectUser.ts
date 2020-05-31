import { User as DiscordUser } from 'discord.js';
import { Middleware, ICommandContext } from 'ghastly';

import { User } from '../../models';
import { ErrorResponse } from '../responses';

type InjectUserConfigFn = (context: ICommandContext) => Promise<{ discordUser: DiscordUser }>;

export default (config?: InjectUserConfigFn): Middleware => async (next, context) => {
  const { message } = context;
  let { author: discordUser } = message;

  if (config) {
    ({ discordUser } = await config(context));
  }

  try {
    let user = await (User as any).findOneByDiscordId(discordUser.id);

    if (!user) user = await new User({ discordId: discordUser.id }).save();

    user.$locals.message = message;

    return next({ ...context, user });
  } catch (err) {
    return ErrorResponse(err.message, context);
  }
};
