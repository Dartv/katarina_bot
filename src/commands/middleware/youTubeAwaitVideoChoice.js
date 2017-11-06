import { ERRORS, YT_VIDEO_CHOICE_TIME } from '../../util/constants';
import { ErrorResponse } from '../responses';

export default ({
  time = YT_VIDEO_CHOICE_TIME,
  maxMatches = 1,
  ...otherOptions
} = {}) => async (next, context) => {
  const { message: { channel, member } } = context;
  try {
    const options = { time, maxMatches, errors: ['time'], ...otherOptions };
    const predicate = (message) => {
      const {
        content,
        member: { id },
      } = message;

      return member.id === id && /^[1-5]$/.test(content);
    };
    const collectedMessages = await channel.awaitMessages(predicate, options);
    const { content } = collectedMessages.first();
    const choice = parseInt(content, 10);

    return next({ ...context, choice });
  } catch (err) {
    return new ErrorResponse(ERRORS.YT_NO_CHOICE, context);
  }
};
