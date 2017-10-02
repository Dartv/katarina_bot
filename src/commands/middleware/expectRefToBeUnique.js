import { findByRef, dispatchError } from '../../util/helpers';

export default arg => async (next, context) => {
  const image = findByRef(context.args[arg], context.user.images);

  if (image) return dispatchError('ref is already in use', context);

  return next(context);
};
