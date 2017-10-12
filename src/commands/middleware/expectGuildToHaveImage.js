import R from 'ramda';

import { ErrorResponse } from '../responses';
import lenses from '../../util/lenses';
import { createErrorResponseFromArgsRef, assignImageByGuildImage } from './util';

export const messages = {
  msg1: 'this guild doesn\'t have any images right now',
  dynamic: {
    msg1: ref => `this guild doesn't have an image "${ref}"`,
  },
};

export default () => async (next, context) => R.ifElse(
  R.compose(R.length, R.view(lenses.guild.images)),
  R.compose(
    R.ifElse(
      R.view(lenses.image),
      next,
      createErrorResponseFromArgsRef(messages.dynamic.msg1),
    ),
    assignImageByGuildImage,
  ),
  ErrorResponse(messages.msg1),
)(context);
