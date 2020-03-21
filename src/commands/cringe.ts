import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import { WallOfShame } from '../models';
import { ErrorResponse } from './responses';

const handler: ICommandHandler = async (context): Promise<any> => {
  const [post] = await WallOfShame.aggregate([
    {
      $sample: {
        size: 1,
      },
    },
  ]);

  if (!post) {
    return ErrorResponse('No cringe found', context);
  }

  const user = context.client.users.get(post.user) || { username: 'unknown' };
  return `${user.username}: ${post.content}`;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.CRINGE,
  description: 'Random cringe',
});
