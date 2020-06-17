import { Document, Model, Types } from 'mongoose';

import { IGuild } from '../guild/types';
import { IUser } from '../user/types';
import * as methods from './methods';
import { ICharacter } from '../character/types';

export interface IWorldBossParticipant {
  user: IUser | Types.ObjectId;
  damage: number;
  joinedAt: Date;
}

export interface IWorldBoss extends Document {
  createdAt: Date;
  updatedAt: Date;
  character: ICharacter | Types.ObjectId;
  guild: IGuild | Types.ObjectId;
  hp: number;
  maxHp: number;
  participants: Map<string, IWorldBossParticipant>;
  completedAt?: Date;
  defeated: boolean;
  injure: typeof methods.injure;
  embed: typeof methods.embed;
}

export type IWorldBossModel = Model<IWorldBoss>;
