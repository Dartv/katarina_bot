import * as params from '../util/parameters';
import { deleteMessage } from './middleware';
import { COMMAND_TRIGGERS } from '../util/constants';

const middleware = [deleteMessage()];

export const handler = async ({ args: { emoji, content } }) =>
  content.join(' ').replace(/o|о/gi, emoji);

export default () => ({
  middleware,
  handler,
  parameters: [params.emoji, {
    ...params.content,
    optional: false,
  }],
  triggers: COMMAND_TRIGGERS.EMOJIFY,
  description: 'Replaces every "o" letter with specified emoji',
});
