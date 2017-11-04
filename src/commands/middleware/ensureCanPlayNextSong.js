import { getQueueSize } from '../../store/actions/queue';

export default skip => async (next, context) => {
  const { services } = context;
  const store = services.get('music.store');
  const queueSize = store.dispatch(getQueueSize(context));

  if (queueSize === 1 || queueSize && skip) return next(context);

  if (skip) return 'end';

  return null;
};
