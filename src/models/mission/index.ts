import {
  Schema, SchemaOptions, SchemaTypes, model,
} from 'mongoose';

import { IMission, IMissionModel } from './types';
import { MissionCode } from '../../util';

const options: SchemaOptions = { timestamps: true };

const MissionSchema: Schema = new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
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
}, options);

MissionSchema.index({ user: 1 });
MissionSchema.index({ code: 1, unique: true });

export default model<IMission, IMissionModel>('mission', MissionSchema);
