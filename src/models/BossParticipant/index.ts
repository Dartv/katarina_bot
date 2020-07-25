import {
  SchemaOptions,
  Schema,
  model,
  Types,
} from 'mongoose';
import { BossParticipantDocument, BossParticipantModel } from '../../types';
import { ModelName } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

const BossParticipantSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: ModelName.USER,
    required: true,
  },
  boss: {
    type: Types.ObjectId,
    ref: ModelName.BOSS,
    required: true,
  },
  damage: {
    type: Number,
    default: 0,
  },
  lastAttackedAt: Date,
}, options);

BossParticipantSchema.index({ boss: 1, user: 1 }, { unique: true });

export const BossParticipant = model<BossParticipantDocument, BossParticipantModel>(
  ModelName.BOSS_PARTICIPANT,
  BossParticipantSchema,
);
