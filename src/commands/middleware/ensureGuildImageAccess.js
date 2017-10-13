import R from 'ramda';

import { ErrorResponse } from '../responses';
import { isImageOwner, isAdmin } from './util.js';

const hasPerms = R.anyPass([isImageOwner, isAdmin]);

export const ONLY_ADMIN_OR_OWNER_CAN_REMOVE_IMAGE =
  'only administrator or image owner can remove this image';

export default () => async (next, context) => R.ifElse(
  hasPerms,
  next,
  ErrorResponse(ONLY_ADMIN_OR_OWNER_CAN_REMOVE_IMAGE),
)(context);
