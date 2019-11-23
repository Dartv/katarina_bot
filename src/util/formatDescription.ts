import R from 'ramda';

import { concatRight } from './helpers';
import lenses from './lenses';

export const formatParameter = R.compose(
  R.join(''),
  R.append('>'),
  R.prepend(' <'),
  R.view(lenses.description),
);

export const formatOptionalParameter = R.ifElse(
  R.view(lenses.optional),
  R.compose(
    R.join(''),
    R.append(']'),
    R.prepend(' ['),
    R.trim as any,
    formatParameter
  ),
  formatParameter,
);

export const formatParameters = ({ commandName, parameters, description }) => R.compose(
  R.join(''),
  R.append('`') as any,
  concatRight(R.map(formatOptionalParameter, parameters)),
  R.append(`usage: \`${process.env.BOT_PREFIX}${commandName}`) as any,
  R.append('\n\n'),
)(description);

export default R.when(
  R.compose(R.not, R.is(String)),
  R.ifElse(
    R.view(lenses.parameters),
    formatParameters,
    R.view(lenses.description),
  ),
);
