import { RichEmbed } from 'discord.js';

import YouTubeItem from '../../services/YoutubeVideo';

export default () => async (next, context) => {
  const {
    args,
    dispatch,
    message,
    services,
  } = context;
  const { query } = args;
  const {
    channel,
    member: {
      id,
    },
  } = message;
  const youtube = services.get('music.youtube');
  let video;

  if (/^https?/i.test(query)) {
    try {
      video = new YouTubeItem(await youtube.getVideo(query));
    } catch (error) {
      return 'Had some problem finding that video, dude.';
    }
  } else {
    try {
      const embed = new RichEmbed();
      const results = await youtube.searchVideos(query);

      embed
      .setTitle('SEARCH RESULTS')
      // eslint-disable-next-line max-len
        .setDescription(`You searched for "${query}". To play a video, enter the result number of the video (e.g. "1" to play the first result) within 60 seconds.`);
      results.forEach((result, index) => {
        const { title, description, publishedAt } = result;

        embed.addField(
          // eslint-disable-next-line max-len
          `${index + 1}. ${title} [${publishedAt.getFullYear()}-${publishedAt.getMonth() + 1}-${publishedAt.getDate()}]`,
          description,
        );
      });

      await dispatch(embed);

      try {
        const collected = await channel.awaitMessages((collectedMessage) => {
          const {
            content,
            member: {
              id: collectedId,
            },
          } = collectedMessage;

          return collectedId === id && /^[1-5]$/.test(content);
        }, {
          time: 60 * 1000,
          maxMatches: 1,
          errors: ['time'],
        });

        const { content } = collected.first();
        const { url } = results[parseInt(content, 10) - 1];
        video = new YouTubeItem(await youtube.getVideo(url));
      } catch (error) {
        return 'You didn\'t choose a video to play, dude. Forget about it.';
      }
    } catch (error) {
      return 'Had some problem finding that video, dude.';
    }
  }

  return next({ ...context, video });
};
