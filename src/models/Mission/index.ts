import {
  SchemaOptions,
  Schema,
  model,
  SchemaTypes,
} from 'mongoose';

import type { MissionDocument, MissionModel } from '../../types';
import { ModelName, MissionCode } from '../../utils/constants';

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
}, options);

MissionSchema.index({ user: 1 });
MissionSchema.index({ code: 1 }, { unique: true });

export const Mission = model<MissionDocument, MissionModel>(ModelName.MISSION, MissionSchema);
