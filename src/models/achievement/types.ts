import { Document, Model, Types } from 'mongoose';
import { IUser } from '../user/types';
import { AchievementCode } from '../../util';

export interface IAchievement extends Document {
  createdAt: Date;
  updatedAt: Date;
  user: Types.ObjectId | IUser;
  completedAt: Date;
  code: AchievementCode;
  stage: number;
  meta: Record<string, any>;
}

export type IAchievementModel = Model<IAchievement>;
