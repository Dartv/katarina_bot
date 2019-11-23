import { isUri } from 'valid-url';

import { ErrorResponse } from '../responses';
import YouTubeItem from '../../services/YoutubeVideo';

export default () => async (next, context) => {
  const { args: { query }, services } = context;
  const youtube = services.get('music.youtube');

  if (!context.video && isUri(query)) {
    try {
      const video = new YouTubeItem(await youtube.getVideo(query));
      return next({ ...context, video });
    } catch (err) {
      return ErrorResponse(err.message, context);
    }
  }

  return next(context);
};
