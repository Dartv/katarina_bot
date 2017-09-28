const User = require('../../models/user');

module.exports = () => async (next, context) => {
  const { message: { author: { id: discordId } } } = context;
  let user = await User.findOneByDiscordId(discordId);

  if (user) {
    Object.assign(context, { user });
    return next(context);
  }

  try {
    user = await new User({ discordId }).save();
  } catch (err) {
    return context.message.reply(err.message);
  }

  Object.assign(context, { user });

  return next(context);
};
