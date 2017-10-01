const R = require('ramda');
const { indexByName, eqProp, findByRef } = require('../helpers');

describe('indexByName', () => {
  it('should index by name', () => {
    const array = [{ name: 1, desc: '' }, { name: 2 }];
    const expected = {
      1: array[0],
      2: array[1],
    };
    const actual = indexByName(array);
    expect(actual).toEqual(expected);
  });
});

describe('eqProp', () => {
  const prop = R.prop('name');
  const name = 'test';

  it('should return true when name matches', () => {
    expect(eqProp(prop, name, { name })).toBe(true);
  });

  it('should return false when name does not match', () => {
    expect(eqProp(prop, 'hello', { name })).toBe(false);
  });
});

describe('findByRef', () => {
  it('should find element by "ref" prop', () => {
    const array = [{ ref: 1 }, { ref: 2 }];
    expect(findByRef(1, array)).toEqual(array[0]);
  });
});
