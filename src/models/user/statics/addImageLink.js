import { ErrorResponse, SuccessResponse } from '../../../commands/responses';
import { handleAll, deleteMessage } from '../../../util/handlers';

export const addImageLink = ({ args: { ref, url }, user }) => user.addImageLink({ ref, url });

export default async (context) => {
  try {
    await handleAll([
      deleteMessage,
      addImageLink,
    ], context);
  } catch (err) {
    return new ErrorResponse(err.message);
  }

  const { args: { ref } } = context;

  return new SuccessResponse(
    `successfully added an image link. Post it with \`${process.env.BOT_PREFIX}post ${ref}\`.`
  );
};
