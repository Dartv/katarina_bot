import { findByRef, dispatchError } from '../../util/helpers';

export default arg => async (next, context) => {
  if (!context.user || !context.user.images.length) {
    return dispatchError('you don\'t have any images right now', context);
  }

  const ref = context.args[arg];
  const image = findByRef(ref, context.user.images);

  if (!image) {
    return dispatchError(`you don't have any image "${ref}"`, context);
  }

  return next({ ...context, image });
};
