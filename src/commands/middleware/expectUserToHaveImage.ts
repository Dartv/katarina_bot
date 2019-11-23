import R from 'ramda';

import { ErrorResponse } from '../responses';
import { lenses } from '../../util';
import { assignImageByUserImage, createErrorResponseFromArgsRef } from './util';

export const YOU_DONT_HAVE_ANY_IMAGES = 'you don\'t have any images right now';

export const youDontHaveImage = ref => `you don't have any image "${ref}"`;

export default () => async (next, context) => R.ifElse(
  (R.compose as any)(R.length, R.view(lenses.user.images as any)),
  R.compose(
    R.ifElse(
      R.view(lenses.image),
      next,
      createErrorResponseFromArgsRef(youDontHaveImage),
    ),
    assignImageByUserImage,
  ),
  ctx => ErrorResponse(YOU_DONT_HAVE_ANY_IMAGES, ctx),
)(context);
