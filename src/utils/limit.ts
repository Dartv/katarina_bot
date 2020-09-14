import PQueue from 'p-queue';

const createAsyncQueue = (intervalCap: number, interval: number): PQueue['add'] => {
  const queue = new PQueue({ intervalCap, interval });
  return queue.add.bind(queue);
};

export const limitScoresaberApiCalls = createAsyncQueue(5, 1000);
