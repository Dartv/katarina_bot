import { isImage, dispatchError } from '../../util/helpers';

export default arg => async (next, context) => {
  if (isImage(context.args[arg])) return next(context);

  return dispatchError('provided url does not point to an image', context);
};
