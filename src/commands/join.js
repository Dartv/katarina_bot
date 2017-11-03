import { expectGuild } from 'ghastly/middleware';

import { ErrorResponse, SuccessResponse } from './responses';
import { createErrorMessage } from '../util/helpers';
import { COMMAND_TRIGGERS } from '../util/constants';
import { validateJoinVoiceChannel } from './middleware';

const ERROR_MESSAGE = createErrorMessage('join the voice channel');
const SUCCESS_MESSAGE = 'Successfully joined the voice channel. Enjoy your music! 🎵';
// const SUCCESS_DESCRIPTION = 'Following commands are available: `leave, play`'; // TODO

const middleware = [expectGuild(), validateJoinVoiceChannel()];

const handler = async (context) => {
  try {
    await context.message.member.voiceChannel.join();
    return SuccessResponse(SUCCESS_MESSAGE, '', context);
  } catch (err) {
    console.error(err.message);
    return ErrorResponse(ERROR_MESSAGE, context);
  }
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.JOIN,
  description: 'Joins a voice channel',
});
