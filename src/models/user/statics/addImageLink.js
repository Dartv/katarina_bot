import { ErrorResponse, SuccessResponse } from '../../../commands/responses';

export default async function addImageLink({
  args: { ref, url },
  user,
  message,
  dispatch,
}) {
  try {
    await message.delete();
  } catch (err) {
    await dispatch(new ErrorResponse(err.message));
  }

  try {
    await user.addImageLink({ ref, url });
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  return new SuccessResponse(
    `successfully added an image link. Post it with \`${process.env.BOT_PREFIX}post ${ref}\`.`
  );
}
