import mongoose from 'mongoose';

import * as statics from './statics';

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

Object.assign(SeriesSchema, { statics });

SeriesSchema.index({ title: 'text' });

export default mongoose.model('series', SeriesSchema);
