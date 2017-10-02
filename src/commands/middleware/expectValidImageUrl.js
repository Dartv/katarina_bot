import R from 'ramda';

export const isImage = R.test(/\.(jpeg|jpg|gif|png)$/);

export default arg => async (next, context) => {
  if (isImage(context.args[arg])) return next(context);

  return context.message.reply('provided url does not point to an image');
};
