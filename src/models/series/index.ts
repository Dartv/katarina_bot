import { model, Schema } from 'mongoose';

import * as statics from './statics';
import { ISeriesModel, ISeries } from './types';

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

export default model<ISeries, ISeriesModel>('series', SeriesSchema);
