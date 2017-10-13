import R from 'ramda';

import { ErrorResponse } from '../responses';
import { findByArgsRef } from './util';

export const REF_ALREADY_IN_USE = 'ref is already in use';

export default lookup => async (next, context) => R.ifElse(
  findByArgsRef(lookup),
  ErrorResponse(REF_ALREADY_IN_USE),
  next,
)(context);
