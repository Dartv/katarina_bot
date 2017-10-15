import { SuccessResponse, ErrorResponse } from '../../../commands/responses';

export default async (context) => {
  const { user, image } = context;

  try {
    await user.removeImageLink(image);
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return SuccessResponse(`successfully removed "${image.ref}"`, '', context);
};
