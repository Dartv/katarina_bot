import Store, { thunk } from 'repatch';
import R from 'ramda';

import {
  enqueue,
  dequeue,
  clear,
  getQueue,
  peek,
  getQueueItem,
  getQueueSize,
} from '../queue';

describe('queue', () => {
  const initialState = {
    entities: {},
    allIds: [],
  };
  const state = {
    entities: {
      1: {
        entities: {
          2: {
            id: 2,
          },
          3: {
            id: 3,
          },
        },
        allIds: [2, 3],
      },
    },
    allIds: [1],
  };
  const context = { message: { guild: { id: 1 } } };

  it('should match snapshots', () => {
    expect(initialState).toMatchSnapshot();
    expect(state).toMatchSnapshot();
    expect(context).toMatchSnapshot();
  });

  it('should enqueue', () => {
    const item = { id: 1 };
    const nextState = enqueue(item, 1)(initialState);
    const queue = nextState.entities[1];

    expect(R.keys(queue.entities)).toHaveLength(1);
    expect(queue.allIds).toHaveLength(1);
    expect(queue.entities[item.id]).toEqual(item);
    expect(queue.allIds).toEqual([item.id]);
  });

  it('should dequeue', async () => {
    const nextState = dequeue(1)(state);

    expect(nextState.entities[1].entities).toEqual({ 3: { id: 3 } });
    expect(nextState.entities[1].allIds).toEqual([3]);
  });

  it('should clear queue', () => {
    const nextState = clear(1)(state);

    expect(nextState.entities[1]).toEqual(initialState);
  });

  it('should get queue', () => {
    const store = new Store(state).addMiddleware(thunk);
    const queue = store.dispatch(getQueue(context));

    expect(queue).toEqual(state.entities[1]);
  });

  it('should peek', () => {
    const store = new Store(state).addMiddleware(thunk);
    const item = store.dispatch(peek(context));

    expect(item).toEqual(state.entities[1].entities[2]);
  });

  it('should get queue item', () => {
    const store = new Store(state).addMiddleware(thunk);
    const item = store.dispatch(getQueueItem(2, context));

    expect(item).toEqual(state.entities[1].entities[2]);
  });

  it('should get queue size', () => {
    const store = new Store(state).addMiddleware(thunk);
    const length = store.dispatch(getQueueSize(context));

    expect(length).toBe(state.entities[1].allIds.length);
  });
});
