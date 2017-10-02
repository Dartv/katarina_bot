export default async function removeImageLink({
  user,
  message,
  image,
}) {
  try {
    await user.removeImageLink(image);
  } catch (err) {
    return message.reply(err.message);
  }

  await message.reply(`successfully removed "${image.ref}"`);
  return this;
}
