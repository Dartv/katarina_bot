import R from 'ramda';

import { ErrorResponse } from '../responses';
import { findByArgsRef } from './util';

export const messages = {
  msg1: 'ref is already in use',
};

export default lookup => async (next, context) => R.ifElse(
  findByArgsRef(lookup),
  ErrorResponse(messages.msg1),
  next,
)(context);
