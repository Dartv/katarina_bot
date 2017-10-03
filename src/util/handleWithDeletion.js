import R from 'ramda';

import { ErrorResponse } from '../commands/responses';

export default R.curry(async (handlers, context) => Promise.all([
  context.message.delete().catch(err =>
    context.dispatch(new ErrorResponse(
      `Unable to delete own message: ${context.formatter.code(err.message)}`
    ))),
  ...R.map(R.flip(R.call)(context), handlers),
]).catch(err => new ErrorResponse(err.message)));
