import { SuccessResponse } from '../../../commands/responses';
import { handleWithDeletion } from '../../../util';

export default context => handleWithDeletion([
  ({ user, image }) => user.removeImageLink(image),
], context).then(() => new SuccessResponse(`successfully removed "${context.image.ref}"`));
