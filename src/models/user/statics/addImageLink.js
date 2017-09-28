module.exports = async function addImageLink({
  args: { ref, url },
  user,
  message,
}) {
  try {
    await user.addImageLink({ ref, url });
  } catch (err) {
    message.reply(err.message);
  }
};
