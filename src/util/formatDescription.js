const R = require('ramda');

const props = require('./props');

module.exports = R.when(
  R.compose(R.not, R.is(String)),
  R.ifElse(
    props.usage,
    ({ commandName, description, usage }) => R.compose(
      R.join(''),
      R.append(`usage: \`${process.env.BOT_PREFIX}${commandName} ${usage}\``),
      R.append('\n\n'),
    )(description),
    props.description,
  ),
);
