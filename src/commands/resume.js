import { expectGuild } from 'ghastly/middleware';
import R from 'ramda';

import { COMMAND_TRIGGERS } from '../util/constants';
import { ensureIsInVoiceChannel, ensureIsPlaying, ensureIsPaused } from './middleware';
import { lenses } from '../util';

const middleware = [
  expectGuild(),
  ensureIsInVoiceChannel(),
  ensureIsPlaying(),
  ensureIsPaused(),
];

export const handler = async (context) => {
  try {
    await R.view(lenses.message.guild.voiceConnection.player.dispatcher.resume, context);
  } catch (err) {
    return err.message;
  }

  return 'resumed';
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.RESUME,
  description: 'Resumes currently paused song',
});
