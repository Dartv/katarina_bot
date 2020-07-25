import { withCooldown, Middleware } from 'diskat';
import { Config } from 'diskat/dist/middleware/withCooldown';

import { CooldownResponse } from '../responses';
import { Context } from '../../types';

export const withInMemoryCooldown = <T extends Context>(
  config: (context: T) => Promise<Config>,
): Middleware<T> => withCooldown(async (context: T) => {
    const options = await config(context);
    return {
      ...options,
      onCooldown: cooldown => new CooldownResponse(context, cooldown.startAt + options.window * 1000),
    };
  });
