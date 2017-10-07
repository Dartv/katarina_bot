import { dispatchError } from '../../util/helpers';

export default () => async (next, context) => {
  const { user, image } = context;

  if (image.user.id !== user.id) {
    return dispatchError('you can only remove images that belongs to you', context);
  }

  return next(context);
};
