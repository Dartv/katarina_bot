import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';
import { ModelName } from '../../utils/constants';
import { BattleParticipantDocument, BattleParticipantModel } from '../../types';

export const options: SchemaOptions = { timestamps: true };

const BattleParticipantSchema = new Schema({
  battle: {
    type: Types.ObjectId,
    ref: ModelName.BATTLE,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: ModelName.USER,
    required: true,
  },
  characters: {
    type: [{
      type: Types.ObjectId,
      ref: ModelName.USER_CHARACTER,
      required: true,
    }],
    required: true,
  },
  isDefeated: {
    type: Boolean,
    default: false,
  },
}, options);

BattleParticipantSchema.index({ battle: 1, user: 1 }, { unique: true });

export const BattleParticipant = model<BattleParticipantDocument, BattleParticipantModel>(
  ModelName.BATTLE_PARTICIPANT,
  BattleParticipantSchema,
);
