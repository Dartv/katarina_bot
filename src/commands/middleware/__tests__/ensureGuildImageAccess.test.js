import R from 'ramda';

import { ensureGuildImageAccess } from '../';

describe('ensureGuildImageAccess', () => {
  const next = R.T;

  test('user should be able to remove guild\'s image if it\'s his image', async () => {
    const context = {
      user: {
        id: 1,
      },
      image: {
        user: {
          id: 1,
        },
      },
    };
    const result = await ensureGuildImageAccess()(next, context);

    expect(result).toBe(true);
  });

  test('user should be able to remove guild\'s image if he is admin', async () => {
    const context = {
      user: {
        id: 1,
      },
      image: {
        user: {
          id: 2,
        },
      },
      message: {
        member: {
          hasPermission: R.T,
        },
      },
    };
    const result = await ensureGuildImageAccess()(next, context);

    expect(result).toBe(true);
  });

  test('user shoudn\'t be able to remove guild\'s image if it isn\'t his image', async () => {
    const context = {
      user: {
        id: 1,
      },
      image: {
        user: {
          id: 2,
        },
      },
      message: {
        member: {
          hasPermission: R.F,
        },
      },
      client: {
        dispatcher: {
          dispatchResponse: () => 'error',
        },
      },
    };
    const result = await ensureGuildImageAccess()(next, context);

    expect(result).toBe('error');
  });
});
