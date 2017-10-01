const R = require('ramda');

const props = require('./props');
const { concatRight } = require('./helpers');

const formatParameter = R.compose(
  R.join(''),
  R.append('>'),
  R.prepend(' <'),
  props.description,
);

const formatParameters = ({ commandName, parameters, description }) => R.compose(
  R.join(''),
  R.append('`'),
  concatRight(R.map(formatParameter, parameters)),
  R.append(`usage: \`${process.env.BOT_PREFIX}${commandName}`),
  R.append('\n\n'),
)(description);

module.exports = R.when(
  R.compose(R.not, R.is(String)),
  R.ifElse(
    props.parameters,
    formatParameters,
    props.description,
  ),
);

module.exports.formatParameter = formatParameter;
module.exports.formatParameters = formatParameters;
