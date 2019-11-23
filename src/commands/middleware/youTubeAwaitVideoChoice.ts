import { ERRORS, YT_VIDEO_CHOICE_TIME } from '../../util/constants';
import { ErrorResponse } from '../responses';

import { deleteMessage } from '../../util/handlers';

export default ({
  time = YT_VIDEO_CHOICE_TIME,
  maxMatches = 1,
  ...otherOptions
} = {}) => async (next, context) => {
  const { message: { channel, member }, youtube = {} } = context;
  try {
    const options = {
      time, maxMatches, errors: ['time'], ...otherOptions,
    };
    const predicate = (message) => {
      const {
        content,
        member: { id },
      } = message;

      return member.id === id && /^[1-5]$/.test(content);
    };
    const collectedMessages = await channel.awaitMessages(predicate, options);
    const firstCollectedMessage = collectedMessages.first();
    const choice = parseInt(firstCollectedMessage.content, 10);

    if (youtube.message) {
      await Promise.all([
        deleteMessage({ ...context, message: youtube.message }),
        deleteMessage({ ...context, message: firstCollectedMessage }),
      ]);
    }

    return next({ ...context, choice });
  } catch (err) {
    return ErrorResponse(ERRORS.YT_NO_CHOICE, context);
  }
};
