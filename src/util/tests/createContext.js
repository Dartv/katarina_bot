import R from 'ramda';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';

export default (newContext) => {
  const context = R.mergeDeepRight({
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
    dispatch: (response) => {
      if (response.executor) {
        return response.executor(context);
      }
      return response;
    },
    formatter: MarkdownFormatter,
  }, newContext);
  return context;
};
