import mongoose from 'mongoose';

mongoose.Promise = Promise;

export default () => {
  mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
  mongoose.connection
    .once('open', () => console.log('Connected to mongo instance'))
    .on('error', error =>
      console.error('An error has occured while trying to connect to mongo instance: ', error));
};
