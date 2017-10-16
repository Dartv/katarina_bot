import { deleteMessage } from '../../util/handlers';

// Should always be the last in middleware chain!

export default () => async (next, context) => {
  deleteMessage(context);
  return next(context);
};
