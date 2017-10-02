import R from 'ramda';

import props from './props';
import { concatRight } from './helpers';

export const formatParameter = R.compose(
  R.join(''),
  R.append('>'),
  R.prepend(' <'),
  props.description,
);

export const formatParameters = ({ commandName, parameters, description }) => R.compose(
  R.join(''),
  R.append('`'),
  concatRight(R.map(formatParameter, parameters)),
  R.append(`usage: \`${process.env.BOT_PREFIX}${commandName}`),
  R.append('\n\n'),
)(description);

export default R.when(
  R.compose(R.not, R.is(String)),
  R.ifElse(
    props.parameters,
    formatParameters,
    props.description,
  ),
);
