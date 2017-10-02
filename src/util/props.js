import { simpleClique } from 'cliquer';
import R from 'ramda';

export default simpleClique(R.prop, [
  'name',
  'ref',
  'usage',
  'description',
  'parameters',
]);
