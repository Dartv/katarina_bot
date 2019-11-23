import R from 'ramda';
import random from 'random-int';

import lenses, { last } from './lenses';

export const indexByName = R.indexBy(R.view(lenses.name));

export const lensEq = R.curry((lens, val, obj) => R.compose(R.equals(val), R.view(lens))(obj));

export const findByRef = R.curry((value, array) => R.find(lensEq(lenses.ref, value), array));

export const concatRight = R.flip(R.concat);

export const isImage = R.test(/\.(jpeg|jpg|gif|png)$/);

export const joinWithArray = R.curry((str, array) => R.when(
  R.always(R.length(array)) as any,
  R.compose(
    concatRight(R.join(', ', array)),
    concatRight(', '),
  ),
  str
));

export const autoWrap = breakAt => R.compose(
  R.join(' '),
  R.flatten,
  R.intersperse('\n'),
  R.reduce((acc, el) => R.ifElse(
    R.anyPass([
      R.complement(R.last),
      R.compose(
        R.gte(R.__, breakAt),
        R.length as any,
        R.join(' '),
        R.append(el),
        R.last,
      ),
    ]),
    R.append([el]),
    R.over(last, R.append(el)),
  )(acc), []),
);

export const getRandomArrayIndex = R.compose(random, R.dec, R.length);
