import { SuccessResponse, ErrorResponse } from '../../../commands/responses';

export default async (context) => {
  const { user } = context;

  try {
    await user.removeAllImageLinks();
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return SuccessResponse('Successfully removed all image links', '', context);
};
