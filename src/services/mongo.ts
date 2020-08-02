import mongoose, { Mongoose } from 'mongoose';

mongoose.Promise = Promise;

export const connectDB = (): Promise<Mongoose> => mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
