import { ErrorResponse } from '../commands/responses';

export const deleteMessage = async (context) => {
  const { message, dispatch, formatter: { code } } = context;
  message.delete()
    .catch(err =>
      dispatch(ErrorResponse(`Unable to delete own message: ${code(err.message)}`, context)));
};
