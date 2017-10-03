import { ErrorResponse, SuccessResponse } from '../../../commands/responses';
import { handleAll, deleteMessage } from '../../../util/handlers';

const removeAllImageLinks = ({ user }) => user.removeAllImageLinks();

export default async (context) => {
  try {
    await handleAll([
      deleteMessage,
      removeAllImageLinks,
    ], context);
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  return new SuccessResponse('successfully removed all image links');
};
