import { expectGuild } from 'ghastly/middleware';

import { COMMAND_TRIGGERS } from '../util/constants';
import { ensureIsInVoiceChannel, ensureIsPlaying, stopCurrentlyPlaying } from './middleware';

const middleware = [
  expectGuild(),
  ensureIsInVoiceChannel(),
  ensureIsPlaying(),
  stopCurrentlyPlaying(),
];

export const handler = async () => null;

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.SKIP,
  description: 'Stops currently playing song and removes it from the queue',
});
