import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  const { args: { mapper }, models: { Subscription }, user } = context;

  const subscription = await Subscription.findOne({ userId: user.id, value: mapper });

  if (!subscription) {
    return new ErrorResponse(`You're not subscribed to ${mapper}`, context);
  }

  return next({ ...context, subscription });
};
