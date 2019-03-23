import {
  injectContext,
  injectUser,
  injectGuild,
  ensureSubscribedToMapper,
} from './middleware';
import { COMMAND_TRIGGERS } from '../util/constants';
import { ErrorResponse, SuccessResponse } from './responses';

export const middleware = [
  injectContext(),
  injectGuild(),
  injectUser(),
  ensureSubscribedToMapper(),
];

export const handler = async (context) => {
  const { args: { mapper }, subscription, models: { Subscription } } = context;

  try {
    await Subscription.deleteOne({ _id: subscription.id });
  } catch (err) {
    console.error(err);
    return ErrorResponse(undefined, context);
  }

  return SuccessResponse(
    `Successfully unsubscribed from ${mapper}`,
    `You'll not be notified anymore when ${mapper} uploads new maps`,
    context,
  );
};

export default () => ({
  middleware,
  handler,
  parameters: [{
    name: 'mapper',
    description: 'mapper name',
  }],
  triggers: COMMAND_TRIGGERS.MAPPER_UNSUB,
  description: 'Unsubscribes from beat saber mapper\'s future maps',
});
