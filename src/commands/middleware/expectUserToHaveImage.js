import { findByRef } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export default arg => async (next, context) => {
  const { user, args } = context;
  if (!user || !user.images.length) {
    return ErrorResponse('you don\'t have any images right now', context);
  }

  const ref = args[arg];
  const image = findByRef(ref, user.images);

  if (!image) {
    return ErrorResponse(`you don't have any image "${ref}"`, context);
  }

  return next({ ...context, image });
};
