import R from 'ramda';

import { ErrorResponse } from '../responses';
import lenses from '../../util/lenses';
import { createErrorResponseFromArgsRef, assignImageByGuildImage } from './util';

export const GUILD_DOESNT_HAVE_ANY_IMAGES = 'this guild doesn\'t have any images right now';

export const guildDoesntHaveImage = ref => `this guild doesn't have an image "${ref}"`;

export default () => async (next, context) => R.ifElse(
  R.compose(R.length, R.view(lenses.guild.images)),
  R.compose(
    R.ifElse(
      R.view(lenses.image),
      next,
      createErrorResponseFromArgsRef(guildDoesntHaveImage),
    ),
    assignImageByGuildImage,
  ),
  ErrorResponse(GUILD_DOESNT_HAVE_ANY_IMAGES),
)(context);
