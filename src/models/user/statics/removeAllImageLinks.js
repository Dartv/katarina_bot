import { ErrorResponse, SuccessResponse } from '../../../commands/responses';

export default async function removeImageLink({
  user,
  message,
}) {
  try {
    await message.delete();
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  try {
    await user.removeAllImageLinks();
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  return new SuccessResponse('successfully removed all image links');
}
