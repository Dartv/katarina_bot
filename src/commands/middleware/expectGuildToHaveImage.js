import R from 'ramda';

import { findByRef } from '../../util/helpers';
import { ErrorResponse } from '../responses';
import lenses from '../../util/lenses';

export const messages = {
  msg1: 'this guild doesn\'t have any images right now',
  dynamic: {
    msg1: ref => `this guild doesn't have an image "${ref}"`,
  },
};

const findGuildImage = R.converge(findByRef, [
  R.view(lenses.args.ref),
  R.view(lenses.guild.images),
]);

const assignImage = R.converge(R.set(lenses.image), [
  findGuildImage,
  R.identity,
]);

const makeDynamicErrorResponse = R.converge(ErrorResponse, [
  R.compose(messages.dynamic.msg1, R.view(lenses.args.ref)),
  R.identity,
]);

export default () => async (next, context) => R.ifElse(
  R.compose(R.length, R.view(lenses.guild.images)),
  R.compose(
    R.ifElse(
      R.view(lenses.image),
      next,
      makeDynamicErrorResponse,
    ),
    assignImage,
  ),
  ErrorResponse(messages.msg1),
)(context);
