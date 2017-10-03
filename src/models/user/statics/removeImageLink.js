import { SuccessResponse, ErrorResponse } from '../../../commands/responses';
import { deleteMessage, handleAll } from '../../../util/handlers';

export const removeImageLink = ({ user, image }) => user.removeImageLink(image);

export default async (context) => {
  try {
    await handleAll([
      deleteMessage,
      removeImageLink,
    ], context);
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  return new SuccessResponse(`successfully removed "${context.image.ref}"`);
};
