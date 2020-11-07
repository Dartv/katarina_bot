import { model, Schema, SchemaOptions } from 'mongoose';

import { BenchDocument } from '../../types';
import { ModelName } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true, collection: ModelName.BENCH };

const BenchSchema = new Schema({
  slug: {
    type: String,
    required: null,
  },
}, options);

BenchSchema.index({ slug: 1 }, { unique: true });

export const Bench = model<BenchDocument>(ModelName.BENCH, BenchSchema);
