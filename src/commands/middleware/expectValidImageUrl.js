import { isImage } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export default arg => async (next, context) => {
  if (isImage(context.args[arg])) return next(context);
  return ErrorResponse('provided url does not point to an image', context);
};
