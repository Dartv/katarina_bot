import R from 'ramda';

import { ErrorResponse } from '../responses';
import { lenses } from '../../util';
import { assignImageByUserImage, createErrorResponseFromArgsRef } from './util';

export const messages = {
  msg1: 'you don\'t have any images right now',
  dynamic: {
    msg1: ref => `you don't have any image "${ref}"`,
  },
};

export default () => async (next, context) => R.ifElse(
  R.compose(R.length, R.view(lenses.user.images)),
  R.compose(
    R.ifElse(
      R.view(lenses.image),
      next,
      createErrorResponseFromArgsRef(messages.dynamic.msg1),
    ),
    assignImageByUserImage,
  ),
  ErrorResponse(messages.msg1),
)(context);
