import R from 'ramda';

import { lenses } from '../../util';
import { isImage } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export const PROVIDED_URL_DOESNT_POINT_TO_IMAGE = 'provided url doesn\'t point to an image';

export default () => async (next, context) => R.ifElse(
  R.compose(isImage, R.view(lenses.args.url as any)),
  next,
  ctx => ErrorResponse(PROVIDED_URL_DOESNT_POINT_TO_IMAGE, ctx),
)(context);
