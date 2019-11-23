import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  const {
    args: { mapper },
    models: { Subscription },
    message: { author },
  } = context;

  const subscription = await Subscription.findOne({ userId: author.id, value: mapper });

  if (subscription) {
    return ErrorResponse(`You've already subscribed to ${mapper}`, context);
  }

  return next(context);
};
