import { concurrentlyD } from '../util/handlers';
import { emoji as emojiParam, content as contentParam } from '../util/parameters';

export const emojifyMessage = async ({ args: { emoji, content } }) =>
  content.join(' ').replace(/o|о/gi, emoji);

export const handler = concurrentlyD([emojifyMessage]);

export default () => ({
  handler,
  parameters: [emojiParam, {
    ...contentParam,
    optional: false,
  }],
  triggers: ['emojify'],
  description: 'Replaces every "o" letter with specified emoji',
});
