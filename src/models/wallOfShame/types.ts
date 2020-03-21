import { Model, Document } from 'mongoose';

export interface IWallOfShame extends Document {
  user: string;
  guild: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IWallOfShameModel = Model<IWallOfShame>;
