import R from 'ramda';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';

export default R.mergeDeepRight({
  args: {},
  message: {
    author: {
      avatarURL: 'http://example.com',
      username: 'John',
      discriminator: '1234',
    },
    channel: {
      send: R.identity,
    },
    member: {
      voiceChannel: {},
      voiceChannelID: null,
    },
    guild: {
      voiceConnection: {
        channel: {},
      },
    },
  },
  client: {
    dispatch: (ctx, response) => response.executor(ctx),
  },
  formatter: MarkdownFormatter,
});
