import { expectGuild } from 'ghastly/middleware';

import { ErrorResponse, SuccessResponse } from './responses';
import { COMMAND_TRIGGERS, ERRORS } from '../util/constants';
import { validateJoinVoiceChannel } from './middleware';

const SUCCESS_MESSAGE = 'Successfully joined a voice channel. Enjoy your music! 🎵';

const middleware = [expectGuild(), validateJoinVoiceChannel()];

const handler = async (context) => {
  try {
    await context.message.member.voiceChannel.join();
    return SuccessResponse(SUCCESS_MESSAGE, '', context);
  } catch (err) {
    return ErrorResponse(ERRORS.VC_UNABLE_TO_JOIN, context);
  }
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.JOIN,
  description: 'Joins a voice channel',
});
