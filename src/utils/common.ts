export const randomInt = (min: number, max: number): number => Math.floor(
  (Math.random() * (max - min + 1)) + min
);

export const randomArrayItem = <T>(array: T[]): T => array[randomInt(0, array.length - 1)];

export const once = <T>(fn: (...args: unknown[]) => T): (...args: unknown[]) => T => {
  let called = false;
  let result: T;
  return (...args) => {
    if (called) {
      return result;
    }
    called = true;
    result = fn(...args);
    return result;
  };
};

export const clamp = (min: number, max: number, value: number): number => {
  if (min > max) {
    throw new Error('min must not be greater than max');
  }

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

export const indexBy = <T = unknown>(
  fn: (item: T) => string,
  data: T[],
): Record<string, T> => data.reduce((acc, item) => ({ ...acc, [fn(item)]: item }), {});

export const capitalize = (str: string): string => str.charAt(0).toUpperCase().concat(str.slice(1));

export const diff = <A, B>(
  a: A[],
  b: B[],
  equals: (aItem: A, bItem: B) => boolean = (aItem: unknown, bItem: unknown) => aItem === bItem,
): { added: (A | B)[], common: (A | B)[], removed: (A | B)[] } => {
  const first = a.slice();
  const second = b.slice();
  const results = first.reduce(
    (acc, aItem) => {
      const idx = second.findIndex(bItem => equals(aItem, bItem));

      if (idx !== -1) {
        second.splice(idx, 1);

        return {
          ...acc,
          common: [...acc.common, aItem],
        };
      }

      return {
        ...acc,
        removed: [...acc.removed, aItem],
      };
    },
    { common: [], removed: [] }
  );

  return {
    ...results,
    added: second,
  };
};
