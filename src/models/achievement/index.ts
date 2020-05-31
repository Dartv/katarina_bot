import {
  Schema, model, SchemaOptions, SchemaTypes,
} from 'mongoose';
import { IAchievement, IAchievementModel } from './types';
import { AchievementCode } from '../../util';

const options: SchemaOptions = { timestamps: true };

const AchievementSchema: Schema<IAchievement> = new Schema({
  completedAt: Date,
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
    required: true,
  },
  code: {
    type: String,
    enum: Object.values(AchievementCode),
    required: true,
  },
  stage: {
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

export default model<IAchievement, IAchievementModel>('achievement', AchievementSchema);
