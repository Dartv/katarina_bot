import R from 'ramda';

import { dispatchError } from '../../util/helpers';
import { isImageOwner, isAdmin } from './util.js';

const hasPerms = R.allPass([isImageOwner, isAdmin]);

export default () => async (next, context) => R.ifElse(
  hasPerms,
  next,
  dispatchError('only administrator or image owner can remove this image'),
)(context);
