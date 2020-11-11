import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';
import { BossDocument, BossModel } from '../../types';
import { ModelName } from '../../utils/constants';
import * as methods from './methods';
import * as statics from './statics';

const options: SchemaOptions = { timestamps: true };

const BossSchema = new Schema({
  character: {
    type: Types.ObjectId,
    ref: ModelName.CHARACTER,
    required: true,
  },
  guild: {
    type: Types.ObjectId,
    ref: ModelName.GUILD,
    required: true,
  },
  endedAt: Date,
  isDefeated: Boolean,
  defeatedAt: Date,
  stats: {
    type: new Schema({
      hp: {
        type: Number,
      },
      maxHp: {
        type: Number,
      },
    }),
    default: {},
  },
  participants: {
    type: [{
      user: {
        type: Types.ObjectId,
        ref: ModelName.USER,
        required: true,
      },
      damage: {
        type: Number,
        default: 0,
      },
      joinedAt: {
        type: Date,
        default: () => new Date(),
      },
    }],
    default: [],
  },
}, options);

BossSchema.index({ guild: 1, createdAt: -1 });

Object.assign(BossSchema, { methods, statics });

export const Boss = model<BossDocument, BossModel>(ModelName.BOSS, BossSchema);
