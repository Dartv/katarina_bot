import R from 'ramda';
import Store, { thunk } from 'repatch';

import { createContext } from '../../../util/tests';
import ensureCanPlayNextSong, { END } from '../ensureCanPlayNextSong';

jest.mock('../../responses/ErrorResponse');

describe('ensureCanPlayNextSong', () => {
  const next = R.T;
  const getContext = state => createContext({
    message: {
      guild: {
        id: 1,
      },
    },
    services: {
      get: () => new Store(state).addMiddleware(thunk),
    },
  });
  const state = {
    entities: {
      1: {
        entities: {
          2: {
            id: 2,
          },
        },
        allIds: [2],
      },
    },
    allIds: [1],
  };
  const emptyState = {
    entities: {
      1: {},
    },
    allIds: [1],
  };

  it('should pass if the queue size is 1', async () => {
    const nextContext = await ensureCanPlayNextSong()(next, getContext(state));

    expect(nextContext).toBe(true);
  });

  it('should pass if the queue is not empty and skip option is provided', async () => {
    const nextContext = await ensureCanPlayNextSong(true)(next, getContext(state));

    expect(nextContext).toBe(true);
  });

  it('should return "end" if the queue is empty and the skip option is provided', async () => {
    const nextContext = await ensureCanPlayNextSong(true)(next, getContext(emptyState));

    expect(nextContext).toBe(END);
  });

  it('should return null if the queue is empty and the skip option is not provided', async () => {
    const nextContext = await ensureCanPlayNextSong()(next, getContext(emptyState));

    expect(nextContext).toBeNull();
  });
});
