import { SuccessResponse, ErrorResponse } from '../../../commands/responses';
import { COMMAND_TRIGGERS as COMMANDS } from '../../../util/constants';

export default async (context) => {
  const { args: { ref, url }, guild, user } = context;

  try {
    await guild.addImageLink({ ref, url, user: user.id });
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return SuccessResponse(
    'Successfully added an image link',
    `post it with \`${process.env.BOT_PREFIX}${COMMANDS.GUILD_POST[0]} ${context.args.ref}\`.`,
    context,
  );
};
