import {
  SchemaOptions,
  Schema,
  model,
  SchemaTypes,
} from 'mongoose';

import type { MissionDocument, MissionModel } from '../../types';
import {
  ModelName,
  MissionCode,
  MissionType,
  MissionFrequency,
} from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

export const MissionSchema = new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: ModelName.USER,
    required: true,
  },
  completedAt: Date,
  resetsAt: Date,
  progress: {
    type: Number,
    default: 0,
  },
  code: {
    type: String,
    required: true,
    enum: Object.values(MissionCode),
  },
  meta: {
    type: {},
    default: {},
  },
  type: {
    type: String,
    enum: Object.values(MissionType),
    required: true,
  },
  frequency: {
    type: String,
    enum: Object.values(MissionFrequency),
    default: MissionFrequency.DAILY,
  },
}, options);

MissionSchema.index({ code: 1, user: 1 }, { unique: true });
MissionSchema.index({ resetsAt: 1, type: 1 });

export const Mission = model<MissionDocument, MissionModel>(ModelName.MISSION, MissionSchema);
