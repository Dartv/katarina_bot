import R from 'ramda';

import { findByRef, dispatchError } from '../../util/helpers';

export default (arg, path) => async (next, context) => {
  const image = findByRef(context.args[arg], R.path(path, context));

  if (image) return dispatchError('ref is already in use', context);

  return next(context);
};
