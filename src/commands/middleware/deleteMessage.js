import { deleteMessage } from '../../util/handlers';

export default () => async (next, context) => {
  deleteMessage(context);
  return next(context);
};
