import { findByRef } from '../../util/helpers';

export default arg => async (next, context) => {
  const image = findByRef(context.args[arg], context.user.images);

  if (image) return context.message.reply('ref is already in use');

  return next(context);
};
