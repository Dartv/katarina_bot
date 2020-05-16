import { Middleware } from 'ghastly';
import { formatDistanceToNow } from 'date-fns';

import { ErrorResponse } from '../responses';
import { redis } from '../../services/redis';

const withPersonalCooldown = (maxAge: number): Middleware => async (next, context) => {
  const { user } = context;

  if (user) {
    const key = `user::${user._id}::cooldown::withPersonalCooldown`;
    const value = await redis.get(key);

    if (value === '1') {
      const ttl = await redis.pttl(key);
      const expireAt = Date.now() + ttl;
      const distance = formatDistanceToNow(expireAt);
      return ErrorResponse(`This command is on the cooldown. Try again in ${distance}`, context);
    }

    await redis.setex(key, maxAge / 1000, 1);
  }

  return next(context);
};

export default withPersonalCooldown;
