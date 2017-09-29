const R = require('ramda');

module.exports = arg => async (next, context) => {
  const image = R.find(R.propEq('ref', context.args[arg]), context.user.images);

  if (image) return context.message.reply('ref is already in use');

  return next(context);
};
