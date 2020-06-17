import {
  Schema, model, SchemaOptions, SchemaTypes,
} from 'mongoose';

import { IWorldBoss, IWorldBossModel } from './types';
import * as methods from './methods';

const options: SchemaOptions = { timestamps: true };

const WorldBossSchema: Schema<IWorldBoss> = new Schema({
  character: {
    type: SchemaTypes.ObjectId,
    ref: 'character',
    required: true,
  },
  guild: {
    type: SchemaTypes.ObjectId,
    ref: 'guild',
    required: true,
  },
  hp: {
    type: Number,
    required: true,
  },
  maxHp: {
    type: Number,
    default(): number {
      return this.hp;
    },
  },
  participants: {
    type: Map,
    of: {
      user: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
        required: true,
      },
      damage: {
        type: Number,
        default: 0,
      },
      joinedAt: {
        type: Date,
        default(): Date {
          return new Date();
        },
      },
    },
    default: new Map(),
  },
  completedAt: Date,
  defeated: {
    type: Boolean,
    default: false,
  },
}, options);

Object.assign(WorldBossSchema, { methods });

export default model<IWorldBoss, IWorldBossModel>('worldBoss', WorldBossSchema);
