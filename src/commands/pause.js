import { expectGuild } from 'ghastly/middleware';
import R from 'ramda';

import { COMMAND_TRIGGERS } from '../util/constants';
import { ensureIsInVoiceChannel, ensureIsPlaying, ensureIsNotPaused } from './middleware';
import { lenses } from '../util';

const middleware = [
  expectGuild(),
  ensureIsInVoiceChannel(),
  ensureIsPlaying(),
  ensureIsNotPaused(),
];

export const handler = async (context) => {
  try {
    await R.view(lenses.message.guild.voiceConnection.player.dispatcher.pause, context);
  } catch (err) {
    return err.message;
  }

  return 'paused';
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.PAUSE,
  description: 'Pauses currently playing song',
});
