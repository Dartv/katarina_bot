const R = require('ramda');

module.exports = R.when(
  R.compose(R.not, R.is(String)),
  R.ifElse(
    R.has('usage'),
    ({ commandName, description, usage }) => R.compose(
      R.join(''),
      R.append(`usage: \`${process.env.BOT_PREFIX}${commandName} ${usage}\``),
      R.append('\n\n'),
    )(description),
    R.prop('description'),
  ),
);
