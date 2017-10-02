import { isUri } from 'valid-url';

import { dispatchError } from '../../util/helpers';

export default arg => async (next, context) => {
  if (isUri(context.args[arg])) return next(context);

  return dispatchError('invalid url provided', context);
};
