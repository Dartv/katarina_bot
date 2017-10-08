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
    const nextContext = await ensureGuildImageAccess()(next, context);

    expect(nextContext).toBe(true);
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
    const nextContext = await ensureGuildImageAccess()(next, context);

    expect(nextContext).toBe(true);
  });

  test('user shoudn\'t be able to remove guild\'s image if he has no access to it', async () => {
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
    const nextContext = await ensureGuildImageAccess()(next, context);

    expect(nextContext).toBe('error');
  });
});
