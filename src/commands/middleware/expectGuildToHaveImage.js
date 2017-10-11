import { findByRef } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export const messages = {
  msg1: 'this guild doesn\'t have any images right now',
  dynamic: {
    msg1: ref => `this guild doesn't have an image "${ref}"`,
  },
};

export default arg => async (next, context) => {
  if (!context.guild || !context.guild.images.length) {
    return ErrorResponse(messages.msg1, context);
  }

  const ref = context.args[arg];
  const image = findByRef(ref, context.guild.images);

  if (!image) {
    return ErrorResponse(messages.dynamic.msg1(ref), context);
  }

  return next({ ...context, image });
};
