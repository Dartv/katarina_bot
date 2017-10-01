const { simpleClique } = require('cliquer');
const R = require('ramda');

module.exports = simpleClique(R.prop, [
  'name',
  'ref',
  'usage',
  'description',
  'parameters',
]);
