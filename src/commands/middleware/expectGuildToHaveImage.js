import { findByRef, dispatchError } from '../../util/helpers';

export default arg => async (next, context) => {
  if (!context.guild || !context.guild.images.length) {
    return dispatchError('this guild doesn\'t have any images right now', context);
  }

  const ref = context.args[arg];
  const image = findByRef(ref, context.guild.images);

  if (!image) {
    return dispatchError(`this guild doesn't have an image "${ref}"`, context);
  }

  return next({ ...context, image });
};
