import mongoose from 'mongoose';

import '../../models';

process.env.NODE_ENV = 'test';

const MONGO_TEST_URI = 'mongodb://localhost/test';

const config = {
  db: {
    test: MONGO_TEST_URI,
  },
  connection: null,
};

// eslint-disable-next-line consistent-return
export const connect = () => new Promise((resolve, reject) => {
  if (config.connection) return resolve();

  const options = {
    useMongoClient: true,
  };

  mongoose.Promise = Promise;

  mongoose.connect(MONGO_TEST_URI, options);

  config.connection = mongoose.connection;

  config.connection
    .once('open', resolve)
    .on('error', (e) => {
      if (e.message.code === 'ETIMEDOUT') {
        console.log(e);

        mongoose.connect(MONGO_TEST_URI, options);
      }

      console.log(e);
      reject(e);
    });
});

export const clearDB = () => new Promise((resolve) => {
  const collections = Object.keys(mongoose.connection.collections);
  collections.forEach((key, i, array) =>
    mongoose.connection.collections[key].remove(() =>
      i === array.length - 1 && resolve()));
});

export const closeDB = async () => {
  try {
    return await config.connection.close();
  } catch (err) {
    console.error(err);
    return err;
  }
};

export default async () => {
  await connect();
  await clearDB();
};
