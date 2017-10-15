import { SuccessResponse, ErrorResponse } from '../../../commands/responses';

export default async (context) => {
  const { guild, image } = context;
  const { ref } = image;

  try {
    await guild.removeImageLink(image);
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return SuccessResponse(`successfully removed "${ref}" from this guild's images`, '', context);
};
