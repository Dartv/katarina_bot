import { VoiceResponse } from 'ghastly/command';
import { expectGuild } from 'ghastly/middleware';

import { COMMAND_TRIGGERS } from '../util/constants';
import { dequeue, peek } from '../store/actions/queue';
import { injectYouTubeVideo, enqueue, ensureCanPlayNextSong } from './middleware';

const middleware = [expectGuild(), injectYouTubeVideo(), enqueue(), ensureCanPlayNextSong()];

const handler = async (context) => {
  const {
    dispatch,
    services,
  } = context;
  const store = services.get('music.store');
  const video = store.dispatch(peek(context));

  await dispatch(video.embed);

  const dispatcher = await dispatch(new VoiceResponse(context, 'stream', video.createStream()));

  await new Promise(resolve => dispatcher.once('end', resolve));

  store.dispatch(dequeue(context.message.guild.id));

  return ensureCanPlayNextSong(true)(handler, context);
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.PLAY,
  parameters: ['query...'],
});
