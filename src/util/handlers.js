import R from 'ramda';

import { ErrorResponse } from '../commands/responses';

export const deleteMessage = async ({ message, dispatch, formatter: { code } }) =>
  message.delete()
    .catch(err =>
      dispatch(new ErrorResponse(`Unable to delete own message: ${code(err.message)}`)));


export const concurrently = R.curry((handlers, context) => R.compose(
  p => p.then().catch(err => new ErrorResponse(err.message)),
  R.last,
  R.juxt(handlers),
)(context));

export const concurrentlyD = handlers => concurrently([deleteMessage, ...handlers]);
