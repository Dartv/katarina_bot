import R from 'ramda';

import { isImageOwner, isAdmin } from '../util';

describe('isImageOwner', () => {
  it('should return true if is an image owner', () => {
    const context = {
      image: {
        user: {
          id: '1',
        },
      },
      user: {
        id: '1',
      },
    };

    expect(isImageOwner(context)).toBe(true);
  });

  it('should return false if is not an image owner', () => {
    const context = {
      image: {
        user: {
          id: '1',
        },
      },
      user: {
        id: '2',
      },
    };

    expect(isImageOwner(context)).toBe(false);
  });
});

describe('isAdmin', () => {
  it('should return true if is admin', () => {
    const context = {
      message: {
        member: {
          hasPermission: R.T,
        },
      },
    };

    expect(isAdmin(context)).toBe(true);
  });

  it('should return false if is not admin', () => {
    const context = {
      message: {
        member: {
          hasPermission: R.F,
        },
      },
    };

    expect(isAdmin(context)).toBe(false);
  });
});
