module.exports = async function removeImageLink({
  user,
  message,
  image,
}) {
  try {
    await user.removeImageLink(image);
  } catch (err) {
    return message.reply(err.message);
  }

  message.reply(`successfully removed "${image.ref}"`);
  return this;
};
