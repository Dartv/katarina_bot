const R = require('ramda');
const props = require('./props');

const indexByName = R.indexBy(props.name);

const eqProp = R.curry((prop, val, obj) => R.compose(R.equals(val), prop)(obj));

const findByRef = R.curry((value, array) => R.find(eqProp(props.ref, value), array));

module.exports = {
  indexByName,
  eqProp,
  findByRef,
};
