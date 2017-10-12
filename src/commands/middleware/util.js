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

export const assignImageByGuildImage = R.converge(R.set(lenses.image), [
  findGuildImageByArgsRef,
  R.identity,
]);

export const createErrorResponse = R.curry((lookup, messageCreator) => R.converge(ErrorResponse, [
  R.compose(messageCreator, lookup),
  R.identity,
]));

export const createErrorResponseFromArgsRef = createErrorResponse(R.view(lenses.args.ref));
