module.exports = async function addImageLink({
  args: { ref, url },
  user,
  message,
}) {
  try {
    await user.addImageLink({ ref, url });
  } catch (err) {
    return message.reply(err.message);
  }

  message.reply(`successfully added an image link. Post it with \`${process.env.BOT_PREFIX}post ${ref}\`.`);
  return this;
};
