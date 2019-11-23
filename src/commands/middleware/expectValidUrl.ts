import R from 'ramda';
import { isUri } from 'valid-url';

import { ErrorResponse } from '../responses';
import { lenses } from '../../util';

export const INVALID_URL_PROVIDED = 'invalid url provided';

export default () => async (next, context) => R.ifElse(
  R.compose(isUri, R.view(lenses.args.url as any)),
  next,
  ctx => ErrorResponse(INVALID_URL_PROVIDED, ctx),
)(context);
