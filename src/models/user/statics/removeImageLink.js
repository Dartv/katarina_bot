import { ErrorResponse, SuccessResponse } from '../../../commands/responses';

export default async function removeImageLink({
  user,
  message,
  image,
}) {
  try {
    await message.delete();
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  try {
    await user.removeImageLink(image);
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  return new SuccessResponse(`successfully removed "${image.ref}"`);
}
