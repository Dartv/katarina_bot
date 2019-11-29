import mongoose from 'mongoose';

const { Schema } = mongoose;

const options = { timestamps: true, collection: 'series' };

const SeriesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
}, options);

Object.assign(SeriesSchema);

SeriesSchema.index({ name: 'text' });

export default mongoose.model('series', SeriesSchema);
