import { isUri } from 'valid-url';

import { ErrorResponse } from '../responses';

export default arg => async (next, context) => {
  if (isUri(context.args[arg])) return next(context);

  return ErrorResponse('invalid url provided', context);
};
