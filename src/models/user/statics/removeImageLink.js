import { ErrorResponse, SuccessResponse } from '../../../commands/responses';

export default async ({ user, message, image }) =>
  Promise.all([message.delete(), user.removeImageLink(image)])
    .then(() => new SuccessResponse(`successfully removed "${image.ref}"`))
    .catch(err => new ErrorResponse(err.message));
