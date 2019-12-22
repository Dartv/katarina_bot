import { Model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { MarriageStatus } from '../../util';

export interface IMarriage extends Document {
  husband: ObjectId;
  wife: ObjectId;
  guild: ObjectId;
  marriedAt?: Date;
  status: MarriageStatus;
  marry(): Promise<IMarriage>;
}

export type IMarriageModel = Model<IMarriage>;
