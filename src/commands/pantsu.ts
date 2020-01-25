import { ICommand, ICommandHandler } from 'ghastly';
import { COMMAND_TRIGGERS } from '../util';
import { FileResponse } from './responses';

const handler: ICommandHandler = async (context): Promise<any> => {
  const { services } = context;
  const reddit = services.get('reddit');
  const post = await reddit.getSubreddit('shimapan').getRandomSubmission();
  return FileResponse('', [post.url], context);
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.PANTSU,
  description: 'Random image from /r/shimapan',
});
