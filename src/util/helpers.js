import R from 'ramda';

import props from './props';
import { ErrorResponse } from '../commands/responses';

export const indexByName = R.indexBy(props.name);

export const eqProp = R.curry((prop, val, obj) => R.compose(R.equals(val), prop)(obj));

export const findByRef = R.curry((value, array) => R.find(eqProp(props.ref, value), array));

export const concatRight = R.flip(R.concat);

export const isImage = R.test(/\.(jpeg|jpg|gif|png)$/);

export const joinWithArray = R.curry((str, array) => R.when(
  R.always(R.length(array)),
  R.compose(
    concatRight(R.join(', ', array)),
    concatRight(', '),
  ),
  str
));

export const dispatch = R.curry((response, context) => context.client.dispatcher.dispatchResponse(
  context,
  response
));

export const dispatchError = R.curry((error, context) =>
  dispatch(new ErrorResponse(error), context));
