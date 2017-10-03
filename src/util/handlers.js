import R from 'ramda';

import { ErrorResponse } from '../commands/responses';

export const deleteMessage = async ({ message, dispatch, formatter: { code } }) =>
  message.delete()
    .catch(err =>
      dispatch(new ErrorResponse(`Unable to delete own message: ${code(err.message)}`)));


export const handleAll = R.curry(async (fns, context) => Promise.all(R.juxt(fns)(context)));
