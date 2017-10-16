import R from 'ramda';

import lenses from './lenses';

export const indexByName = R.indexBy(R.view(lenses.name));

export const lensEq = R.curry((lens, val, obj) => R.compose(R.equals(val), R.view(lens))(obj));

export const findByRef = R.curry((value, array) =>
  R.find(lensEq(lenses.ref, value), array));

export const concatRight = R.flip(R.concat);

export const isImage = R.test(/\.(jpeg|jpg|gif|png)$/);

export const joinWithArray = R.curry((str, array) => R.when(
  R.always(R.length(array)),
  R.compose(
    concatRight(R.join(', ', array)),
    concatRight(', '),
  ),
  str
));

export const getFullName = ({ username, discriminator }) => `${username}#${discriminator}`;
