import R from 'ramda';

import { ErrorResponse } from '../responses';
import { isImageOwner, isAdmin } from './util.js';

const hasPerms = R.anyPass([isImageOwner, isAdmin]);

export const messages = {
  msg1: 'only administrator or image owner can remove this image',
};

export default () => async (next, context) => R.ifElse(
  hasPerms,
  next,
  ErrorResponse(messages.msg1),
)(context);
