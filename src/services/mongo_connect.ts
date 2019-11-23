import mongoose from 'mongoose';

mongoose.Promise = Promise;

mongoose.connect(process.env.MONGO_URI, {
  useFindAndModify: false,
});

mongoose.connection
  .once('open', () => console.log('Connected to mongo instance'))
  .on('error', (error) => {
    console.error('An error has occured while trying to connect to mongo instance: ', error);
  });
