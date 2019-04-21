import { COMMAND_TRIGGERS } from '../util/constants';
import { ImageResponse, ErrorResponse } from './responses';
import { withCooldown } from './middleware';

export const middleware = [withCooldown(1000)];

export const handler = async (context) => {
  const { args: { query }, services } = context;
  const booru = services.get('danbooru');
  try {
    const options = { tags: query.join(' '), random: true, limit: 1 };
    const posts = await booru.posts(options);
    const post = posts[0];
    const url = booru.url(post.file_url);
    return ImageResponse(url, '', context);
  } catch (err) {
    return ErrorResponse('Couldn\'t fetch danbooru image', context);
  }
};

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.DANBOORU,
  parameters: [{
    name: 'query',
    description: 'search query',
    optional: true,
    repeatable: true,
    defaultValue: '',
  }],
  description: 'Gets random image from danbooru',
});
