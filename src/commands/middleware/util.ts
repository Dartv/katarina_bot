import R from 'ramda';

import { lenses } from '../../util';
import { findByRef } from '../../util/helpers';
import { ErrorResponse } from '../responses';

export const isImageOwner = ({ user, image }) => R.eqProps('id', user, image.user);

export const isAdmin = ({ message: { member } }) => member.hasPermission('ADMINISTRATOR');

export const findByArgsRef = lookup => R.converge(findByRef, [
  R.view(lenses.args.ref as any),
  lookup,
]);
export const findGuildImageByArgsRef = findByArgsRef(R.view(lenses.guild.images as any));
export const findUserImageByArgsRef = findByArgsRef(R.view(lenses.user.images as any));

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
export const createErrorResponseFromArgsRef = createErrorResponse(R.view(lenses.args.ref as any));

export const composeMiddleware = (...functions) => {
  if (functions.length === 1) {
    return functions[0];
  }

  return functions.reduceRight((f, next) => (...args) => next(f, ...args));
};

export function applyMiddleware(...middleware) {
  middleware.forEach((layer) => {
    if (typeof layer !== 'function') {
      throw new TypeError('Expected all provided middleware to be functions.');
    }
  });

  return (handler) => {
    if (typeof handler !== 'function') {
      // eslint-disable-next-line max-len
      throw new TypeError('Expected handler to be a function. Middleware can only be applied to functions.');
    }

    return composeMiddleware(...middleware, handler);
  };
}

export const combineMiddleware = <T extends (...args: any[]) => any>(
  ...middleware: T[]
) => (next: T, ...args: any[]): T => applyMiddleware(...middleware)(next)(...args);
