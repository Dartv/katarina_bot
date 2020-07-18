import { SchemaOptions, Schema, model } from 'mongoose';

import type { SeriesDocument, SeriesModel } from '../../types';
import { ModelName } from '../../utils/constants';
import * as statics from './statics';

const options: SchemaOptions = { timestamps: true, collection: 'series' };

const SeriesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
}, options);

SeriesSchema.index({ slug: 1 }, { unique: true });
SeriesSchema.index({ title: 'text' });

Object.assign(SeriesSchema, { statics });

export const Series = model<SeriesDocument, SeriesModel>(ModelName.SERIES, SeriesSchema);
