import YouTubeItem from '../../services/YoutubeVideo';
import { ErrorResponse } from '../responses';
import { ERRORS } from '../../util/constants';

export default () => async (next, context) => {
  if (context.video) return next(context);

  const {
    services,
    videos,
    choice,
  } = context;
  const youtube = services.get('music.youtube');

  try {
    const { url } = videos[choice - 1];
    const video = new YouTubeItem(await youtube.getVideo(url));

    return next({ ...context, video });
  } catch (err) {
    return new ErrorResponse(ERRORS.YT_NOT_FOUND);
  }
};
