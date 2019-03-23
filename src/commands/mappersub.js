import {
  injectContext,
  injectUser,
  injectGuild,
  checkSubscribedToMapper,
} from './middleware';
import { COMMAND_TRIGGERS, Topics } from '../util/constants';
import { ErrorResponse, SuccessResponse } from './responses';

export const middleware = [
  injectContext(),
  injectGuild(),
  injectUser(),
  checkSubscribedToMapper(),
];

// TODO: check if mapper exists
export const handler = async (context) => {
  const { args: { mapper }, user, guild, models: { Subscription } } = context;

  try {
    await new Subscription({
      userId: user.id,
      guildId: guild.id,
      topic: Topics.MAPPER,
      value: [mapper],
    }).save();
  } catch (err) {
    console.error(err);
    return ErrorResponse(undefined, context);
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
  triggers: COMMAND_TRIGGERS.MAPPER_SUB,
  description: 'Subscribes to beat saber mapper\'s future maps',
});
