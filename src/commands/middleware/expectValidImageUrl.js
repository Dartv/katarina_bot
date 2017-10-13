import R from 'ramda';

import { lenses } from '../../util';
import { isImage } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export const messages = {
  msg1: 'provided url doesn\'t point to an image',
};

export default () => async (next, context) => R.ifElse(
  R.compose(isImage, R.view(lenses.args.url)),
  next,
  ErrorResponse(messages.msg1),
)(context);
