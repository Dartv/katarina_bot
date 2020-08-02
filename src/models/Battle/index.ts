import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';
import { BattleDocument, BattleModel } from '../../types';
import { ModelName, BattleStatus, BattleType } from '../../utils/constants';

export const options: SchemaOptions = { timestamps: true };

const BattleSchema = new Schema({
  guild: {
    type: Types.ObjectId,
    ref: ModelName.GUILD,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(BattleStatus),
    default: BattleStatus.WAITING,
  },
  type: {
    type: String,
    enum: Object.values(BattleType),
    required: true,
  },
}, options);

BattleSchema.index({
  guild: 1,
  type: 1,
  status: 1,
  createdAt: -1,
});

BattleSchema.index({ status: 1, type: 1, createdAt: 1 });

export const Battle = model<BattleDocument, BattleModel>(ModelName.BATTLE, BattleSchema);
