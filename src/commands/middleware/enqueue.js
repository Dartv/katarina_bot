import { ErrorResponse, SuccessResponse } from '../responses';
import { getQueueItem, enqueue } from '../../store/actions/queue';
import { ERRORS } from '../../util/constants';


export default () => async (next, context) => {
  const { services, message: { guild }, video, dispatch, formatter: { bold } } = context;
  const store = services.get('music.store');

  if (!guild.voiceConnection) return new ErrorResponse(ERRORS.VC_NOT_FOUND, context);

  const queueItem = store.dispatch(getQueueItem(video.id, context));

  if (queueItem) return new ErrorResponse(ERRORS.VC_ALREADY_QUEUED, context);

  store.dispatch(enqueue(video, guild.id));

  await dispatch(new SuccessResponse(`Successfully queued ${bold(video.title)}`, '', context));

  return next(context);
};
