import { expectGuild } from 'ghastly/middleware';

import { COMMAND_TRIGGERS } from '../util/constants';
import { ensureIsInVoiceChannel, ensureIsPlaying, stopCurrentlyPlaying } from './middleware';
import { clear } from '../store/actions/queue';

const middleware = [
  expectGuild(),
  ensureIsInVoiceChannel(),
  ensureIsPlaying(),
  stopCurrentlyPlaying(),
];

export const handler = async (context) => {
  const { services, message: { guild } } = context;
  const store = services.get('music.store');

  return store.dispatch(clear(guild.id));
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.STOP,
  description: 'Stops currently playing song',
});
