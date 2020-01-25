import { User as DiscordUser } from 'discord.js';
import { Middleware, ICommandContext } from 'ghastly';

import { User } from '../../models';
import { ErrorResponse } from '../responses';

type InjectUserConfigFn = (context: ICommandContext) => Promise<{ discordUser: DiscordUser }>;

export default (config?: InjectUserConfigFn): Middleware => async (next, context) => {
  let { message: { author: discordUser } } = context;

  if (config) {
    ({ discordUser } = await config(context));
  }

  try {
    let user = await (User as any).findOneByDiscordId(discordUser.id);

    if (!user) user = await new User({ discordId: discordUser.id }).save();

    return next({ ...context, user });
  } catch (err) {
    return ErrorResponse(err.message, context);
  }
};
