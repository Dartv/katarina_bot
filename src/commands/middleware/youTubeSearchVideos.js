import { RichEmbed } from 'discord.js';

import { ErrorResponse } from '../responses';
import { ERRORS, YT_VIDEO_CHOICE_TIME } from '../../util/constants';

const time = YT_VIDEO_CHOICE_TIME / 1000;

export default () => async (next, context) => {
  const { dispatch, services, args: { query } } = context;

  try {
    const youtube = services.get('music.youtube');
    const embed = new RichEmbed();
    const videos = await youtube.searchVideos(query);

    embed
      .setTitle('SEARCH RESULTS')
      // eslint-disable-next-line max-len
      .setDescription(`You searched for "${query}". To play a video, enter the result number of the video (e.g. "1" to play the first result) within ${time} seconds.`);

    videos.forEach(({ title, description, publishedAt }, index) => {
      embed.addField(
        // eslint-disable-next-line max-len
        `${index + 1}. ${title} [${publishedAt.getFullYear()}-${publishedAt.getMonth() + 1}-${publishedAt.getDate()}]`,
        description,
      );
    });

    await dispatch(embed);

    return next({ ...context, videos });
  } catch (err) {
    return new ErrorResponse(ERRORS.YT_COULD_NOT_DISPLAY_SEARCH_RESULTS, context);
  }
};
