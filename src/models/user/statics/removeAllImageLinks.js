module.exports = async function removeImageLink({
  user,
  message,
}) {
  try {
    await user.removeAllImageLinks();
  } catch (err) {
    return message.reply(err.message);
  }

  message.reply('successfully removed all image links');
  return this;
};
