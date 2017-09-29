const R = require('ramda');

const isImage = R.test(/\.(jpeg|jpg|gif|png)$/);

module.exports = arg => async (next, context) => {
  if (isImage(context.args[arg])) return next(context);

  return context.message.reply('provided url does not point to an image');
};
