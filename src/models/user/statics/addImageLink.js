import { SuccessResponse, ErrorResponse } from '../../../commands/responses';
import { COMMAND_TRIGGERS as COMMANDS } from '../../../util/constants';

export default async (context) => {
  const { args: { ref, url }, user } = context;

  try {
    await user.addImageLink({ ref, url });
  } catch (err) {
    return ErrorResponse(err.message);
  }

  return SuccessResponse(
    'Successfully added an image link',
    `post it with \`${process.env.BOT_PREFIX}${COMMANDS.POST[0]} ${ref}\`.`,
    context,
  );
};
