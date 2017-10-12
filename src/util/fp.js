import R from 'ramda';

export const mapDeep = R.curry((fn, obj) => R.map((value) => {
  if (Array.isArray(value) || R.type(value) === 'Object') return mapDeep(fn, value);

  return fn(value);
}, obj));
