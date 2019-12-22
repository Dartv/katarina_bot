import { Schema, SchemaTypes, model } from 'mongoose';

import { IMarriage, IMarriageModel } from './types';
import User from '../user';
import Guild from '../guild';
import { MarriageStatus } from '../../util';
import * as methods from './methods';

const options = { timestamps: true };

const MarriageSchema = new Schema({
  husband: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: User.modelName,
  },
  wife: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: User.modelName,
  },
  guild: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: Guild.modelName,
  },
  status: {
    type: String,
    required: true,
    default: MarriageStatus.PROPOSED,
    enum: Object.values(MarriageStatus),
  },
  marriedAt: Date,
}, options);

MarriageSchema.index({
  husband: 1,
  wife: 1,
  guild: 1,
}, { unique: true });

Object.assign(MarriageSchema, { methods });

export default model<IMarriage, IMarriageModel>('marriage', MarriageSchema);
