import User from '../../models/user';

export default () => async (next, context) => {
  const { message: { author: { id: discordId } } } = context;
  let user = await User.findOneByDiscordId(discordId);

  if (user) return next({ ...context, user });

  try {
    user = await new User({ discordId }).save();
  } catch (err) {
    return context.message.reply(err.message);
  }

  return next({ ...context, user });
};
