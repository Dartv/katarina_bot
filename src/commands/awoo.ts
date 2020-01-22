import { ICommand, ICommandHandler } from '../types';
import { COMMAND_TRIGGERS } from '../util';
import { FileResponse } from './responses';

const handler: ICommandHandler = async (context): Promise<any> => {
  const { services } = context;
  const reddit = services.get('reddit');
  const post = await reddit.getSubreddit('awoo').getRandomSubmission();
  return FileResponse('', [post.url], context);
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.AWOO,
  description: 'Random image from /r/awoo',
});
