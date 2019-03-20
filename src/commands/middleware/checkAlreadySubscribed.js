import { ErrorResponse } from '../responses';

export default () => async (next, context) => {
  const { args: { mapper }, guild } = context;

  if (guild.subscribedMappers && guild.subscribedMappers.includes(mapper)) {
    return new ErrorResponse(`Your guild is already subscribed to ${mapper}`, context);
  }

  return next(context);
};
