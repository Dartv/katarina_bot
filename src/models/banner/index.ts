import { Schema, model, SchemaTypes } from 'mongoose';
import { IBanner, IBannerModel } from './types';

const options = { timestamps: true };

const BannerSchema: Schema = new Schema({
  character: {
    type: SchemaTypes.ObjectId,
    ref: 'character',
    required: true,
  },
  endedAt: Date,
  createdBy: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
    required: true,
  },
}, options);

BannerSchema.index({ endedAt: 1 });
BannerSchema.index({ createdAt: -1 });

export default model<IBanner, IBannerModel>('banner', BannerSchema);
