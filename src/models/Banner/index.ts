import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';
import { BannerDocument, BannerModel } from '../../types';
import { ModelName } from '../../utils/constants';
import * as statics from './statics';
import * as methods from './methods';

const options: SchemaOptions = { timestamps: true };

const BannerSchema = new Schema({
  featured: {
    type: Types.ObjectId,
    ref: ModelName.CHARACTER,
    required: true,
  },
  endedAt: Date,
}, options);

BannerSchema.index({ endedAt: 1, character: 1 });

Object.assign(BannerSchema, { statics, methods });

export const Banner = model<BannerDocument, BannerModel>(ModelName.BANNER, BannerSchema);
