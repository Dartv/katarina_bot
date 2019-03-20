import {
  injectUser,
  injectGuild,
  checkAlreadySubscribed,
} from './middleware';
import { COMMAND_TRIGGERS } from '../util/constants';
import { ErrorResponse, SuccessResponse } from './responses';

export const middleware = [
  injectGuild(),
  injectUser(),
  checkAlreadySubscribed(),
];

export const handler = async (context) => {
  const { args: { mapper }, guild } = context;

  try {
    await guild.subscribeToMapper({ mapper });
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return SuccessResponse(
    `Successfully subscribed to ${mapper}`,
    `You'll be notified when ${mapper} uploads new maps`,
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
  triggers: COMMAND_TRIGGERS.BSSUBSCRIBE,
  description: 'Subscribes to beat saber mapper\'s future maps',
});
