import R from 'ramda';
import {
  indexByName,
  lensEq,
  findByRef,
  concatRight,
  joinWithArray,
  autoWrap,
} from '../helpers';

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

describe('lensEq', () => {
  const lens = R.lensProp('name');
  const name = 'test';

  it('should return true when name matches', () => {
    expect(lensEq(lens, name, { name })).toBe(true);
  });

  it('should return false when name does not match', () => {
    expect(lensEq(lens, 'hello', { name })).toBe(false);
  });
});

describe('findByRef', () => {
  it('should find element by "ref" prop', () => {
    const array = [{ ref: 1 }, { ref: 2 }];
    expect(findByRef(1, array)).toEqual(array[0]);
  });
});

describe('concatRight', () => {
  it('should concat two arrays from right', () => {
    expect(concatRight([2, 3], [1])).toEqual([1, 2, 3]);
  });
});

describe('joinWithArray', () => {
  it('should join string with array', () => {
    expect(joinWithArray('Hello', ['John', 'Marry'])).toBe('Hello, John, Marry');
  });
});

describe('autoWrap', () => {
  it('should auto wrap text', () => {
    const breakAt = 18;
    const content = ['hello', 'there', 'my', 'beautiful', 'friend.', 'How', 'are', 'you', 'doing?'];
    const expected = [
      'hello', 'there', 'my', '\n',
      'beautiful', 'friend.', '\n',
      'How', 'are', 'you', '\n',
      'doing?',
    ];
    const actual = autoWrap(breakAt)(content);
    expect(actual).toEqual(expected);
  });
});
