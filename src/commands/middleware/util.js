import R from 'ramda';

import { lenses } from '../../util';
import { findByRef } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export const isImageOwner = ({ user, image }) => R.eqProps('id', user, image.user);

export const isAdmin = ({ message: { member } }) => member.hasPermission('ADMINISTRATOR');

export const findByArgsRef = lookup => R.converge(findByRef, [
  R.view(lenses.args.ref),
  lookup,
]);
export const findGuildImageByArgsRef = findByArgsRef(R.view(lenses.guild.images));
export const findUserImageByArgsRef = findByArgsRef(R.view(lenses.user.images));

export const assignImage = setter => R.converge(R.set(lenses.image), [
  setter,
  R.identity,
]);
export const assignImageByGuildImage = assignImage(findGuildImageByArgsRef);
export const assignImageByUserImage = assignImage(findUserImageByArgsRef);

export const createErrorResponse = R.curry((lookup, messageCreator) => R.converge(ErrorResponse, [
  R.compose(messageCreator, lookup),
  R.identity,
]));
export const createErrorResponseFromArgsRef = createErrorResponse(R.view(lenses.args.ref));
