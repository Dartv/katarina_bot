import { Middleware } from 'ghastly';
import { formatDistanceToNow } from 'date-fns';

import { ErrorResponse } from '../responses';
import { redis } from '../../services/redis';
import { extractCommandFromContext } from '../../util/command';
import { getTimeInSecondsUntilDailyReset } from '../../util/daily';

const withPersonalCooldown = ({
  maxAge,
  daily,
}: { maxAge?: number; daily?: boolean }): Middleware => async (next, context) => {
  const { user } = context;
  const command = extractCommandFromContext(context);

  if (user) {
    const key = `user::${user._id}::cooldown::${command}`;
    const value = await redis.get(key);

    if (value === '1') {
      const ttl = await redis.pttl(key);
      const expireAt = Date.now() + ttl;
      const distance = formatDistanceToNow(expireAt);
      return ErrorResponse(`This command is on the cooldown. Try again in ${distance}`, context);
    }

    if (daily) {
      await redis.setex(key, getTimeInSecondsUntilDailyReset(), 1);
    } else {
      await redis.setex(key, maxAge, 1);
    }
  }

  return next(context);
};

export default withPersonalCooldown;
