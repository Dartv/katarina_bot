import { Document, Types, Model } from 'mongoose';
import { IUser } from '../user/types';
import { ICharacter } from '../character/types';

export interface IBanner extends Document {
  character: ICharacter | Types.ObjectId;
  endedAt: Date;
  createdBy: IUser | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IBannerModel = Model<IBanner>;
