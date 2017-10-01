const { findByRef } = require('../../util/helpers');

module.exports = arg => async (next, context) => {
  if (!context.user || !context.user.images.length) {
    return context.message.reply('you don\'t have any images right now');
  }

  const image = findByRef(context.args[arg], context.user.images);

  if (!image) return context.message.reply('you don\'t have any image with that ref');

  return next({ ...context, image });
};
