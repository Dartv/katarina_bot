import R from 'ramda';
import Store, { thunk } from 'repatch';

import { createContext } from '../../../util/tests';
import { ERRORS } from '../../../util/constants';
import enqueue from '../enqueue';
import { getQueueItem } from '../../../store/actions/queue';

jest.mock('../../responses/ErrorResponse');

describe('enqueue', () => {
  let store;
  const next = R.T;
  const getContext = state => createContext({
    message: {
      guild: {
        id: 1,
        voiceConnection: {},
      },
    },
    services: {
      get: () => {
        store = new Store(state).addMiddleware(thunk);
        return store;
      },
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

  beforeEach(() => {
    store = null;
  });

  it('should match snapshots', () => {
    expect(state).toMatchSnapshot();
    expect(getContext(state)).toMatchSnapshot();
  });

  it('should dispatch an error if no voice channel found', async () => {
    const context = {
      message: {
        guild: {
          voiceConnection: null,
        },
      },
    };
    const { executor } = await enqueue()(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.VC_NOT_FOUND);
  });

  it('should dispatch an error if the item is already queued', async () => {
    const context = {
      ...getContext(state),
      video: {
        id: 2,
      },
    };
    const { executor } = await enqueue()(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.YT_ALREADY_QUEUED);
  });

  it('should pass if successfully queued', async () => {
    const video = { id: 3 };
    const context = {
      ...getContext(state),
      video,
    };
    const response = await enqueue()(next, context);
    const item = store.dispatch(getQueueItem(video.id, context));

    expect(response).toBe(true);
    expect(item).toEqual(video);
  });
});
