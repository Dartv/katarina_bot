import PQueue from 'p-queue';

const createAsyncQueue = (intervalCap: number, interval: number): PQueue['add'] => {
  const queue = new PQueue({ intervalCap, interval });
  return queue.add.bind(queue);
};

// scoresaber api limit
export const limitScoresaberApiCalls = createAsyncQueue(80, 1 * 60 * 1000);
