import { VoiceResponse } from 'ghastly/command';
import { expectGuild } from 'ghastly/middleware';

import { COMMAND_TRIGGERS } from '../util/constants';
import {
  enqueue,
  dequeue,
  peek,
  getQueueItem,
  getQueueSize,
} from '../store/actions/queue';
import { injectYouTubeVideo } from './middleware';

const middleware = [expectGuild(), injectYouTubeVideo()];

const playVideo = async (dispatch, store, context) => {
  const video = store.dispatch(peek(context));

  await dispatch(video.embed);

  const dispatcher = await dispatch(new VoiceResponse(context, 'stream', video.createStream()));

  return dispatcher.once('end', async () => {
    await store.dispatch(dequeue(context.message.guild.id));

    const queueSize = store.dispatch(getQueueSize(context));

    if (queueSize) return playVideo(dispatch, store, context);

    return dispatch('end');
  });
};

const handler = async (context) => {
  const {
    dispatch,
    message,
    services,
    video,
  } = context;
  const {
    guild: {
      id: guildId,
      voiceConnection,
    },
  } = message;
  const store = services.get('music.store');

  if (!voiceConnection) {
    return 'ERR';
  }
  const queueItem = store.dispatch(getQueueItem(video.id, context));

  if (queueItem) return 'Already queued';

  store.dispatch(enqueue(video, guildId));

  await dispatch('Successfully queued');

  const queueSize = store.dispatch(getQueueSize(context));

  if (queueSize === 1) {
    return playVideo(dispatch, store, context);
  }

  return undefined;
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.PLAY,
  parameters: ['query...'],
});
