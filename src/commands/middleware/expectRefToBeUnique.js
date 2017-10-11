import R from 'ramda';

import { findByRef } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export default (arg, path) => async (next, context) => {
  const image = findByRef(context.args[arg], R.path(path, context));

  if (image) return ErrorResponse('ref is already in use', context);

  return next(context);
};
