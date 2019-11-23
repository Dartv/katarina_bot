import { ErrorResponse, SuccessResponse } from '../responses';
import { getQueueItem, enqueue } from '../../store/actions/queue';
import { ERRORS } from '../../util/constants';


export default () => async (next, context) => {
  const { message: { guild } } = context;

  const {
    services, video, dispatch, formatter: { bold },
  } = context;
  const store = services.get('music.store');
  const queueItem = store.dispatch(getQueueItem(video.id, context));

  if (queueItem) return ErrorResponse(ERRORS.YT_ALREADY_QUEUED, context);

  store.dispatch(enqueue(video, guild.id));

  await dispatch(SuccessResponse(`Successfully queued ${bold(video.title)}`, '', context));

  return next(context);
};
