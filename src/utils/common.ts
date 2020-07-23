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

export const descend = <T>(fn: (x: T) => unknown, a: T, b: T): number => {
  const aa = fn(a);
  const bb = fn(b);

  if (aa > bb) {
    return -1;
  }

  return aa < bb ? 1 : 0;
};
