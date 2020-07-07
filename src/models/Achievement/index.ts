import {
  SchemaOptions,
  Schema,
  model,
  SchemaTypes,
} from 'mongoose';

import type { AchievementDocument, AchievementModel } from '../../types';
import { ModelName, AchievementCode } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

const AchievementSchema = new Schema({
  completedAt: Date,
  user: {
    type: SchemaTypes.ObjectId,
    ref: ModelName.USER,
    required: true,
  },
  code: {
    type: String,
    required: true,
    enum: Object.values(AchievementCode),
  },
  progress: {
    type: Number,
    default: 0,
  },
  meta: {
    type: {},
    default: {},
  },
}, options);

AchievementSchema.index({ code: 1 });
AchievementSchema.index({ user: 1 });

export const Achievement = model<AchievementDocument, AchievementModel>(ModelName.ACHIEVEMENT, AchievementSchema);
