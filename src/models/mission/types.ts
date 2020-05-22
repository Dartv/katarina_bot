import { Document, Model, Types } from 'mongoose';

import { IUser } from '../user/types';
import { MissionCode } from '../../util';

export interface IMission extends Document {
  user: IUser | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date;
  resetsAt: Date;
  progress: number;
  code: MissionCode;
}

export type IMissionModel = Model<IMission>;
