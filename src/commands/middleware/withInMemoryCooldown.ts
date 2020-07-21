import { withCooldown, Middleware } from 'diskat';
import { formatDistanceStrict } from 'date-fns';
import { Config } from 'diskat/dist/middleware/withCooldown';

import { ErrorResponse } from '../responses';
import { Context } from '../../types';

export const withInMemoryCooldown = <T extends Context>(
  config: (context: T) => Promise<Config>,
): Middleware<T> => withCooldown(async (context: T) => {
    const options = await config(context);
    return {
      ...options,
      onCooldown: cooldown => new ErrorResponse(
        context,
        `This command is on a cooldown. \
        Please wait ${formatDistanceStrict(Date.now(), cooldown.startAt + options.window * 1000)}`,
      ),
    };
  });
