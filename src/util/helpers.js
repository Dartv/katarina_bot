const R = require('ramda');
const props = require('./props');

const indexByName = R.indexBy(props.name);

const eqProp = R.curry((prop, val, obj) => R.compose(R.equals(val), prop)(obj));

const findByRef = R.curry((value, array) => R.find(eqProp(props.ref, value), array));

const concatRight = R.flip(R.concat);

const joinWithArray = R.curry((str, array) => R.when(
  R.always(R.length(array)),
  R.compose(
    concatRight(R.join(', ', array)),
    concatRight(', '),
  ),
  str
));

module.exports = {
  indexByName,
  eqProp,
  findByRef,
  concatRight,
  joinWithArray,
};
