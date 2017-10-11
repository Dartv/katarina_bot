import R from 'ramda';

import { ErrorResponse } from '../commands/responses';

export const deleteMessage = async (context) => {
  const { message, dispatch, formatter: { code } } = context;
  message.delete()
    .catch(err =>
      dispatch(ErrorResponse(`Unable to delete own message: ${code(err.message)}`, context)));
};


export const concurrently = R.curry((handlers, context) => R.compose(
  p => p.catch(err => ErrorResponse(err.message, context)),
  R.last,
  R.juxt(handlers),
)(context));

export const concurrentlyD = handlers => concurrently([deleteMessage, ...handlers]);
