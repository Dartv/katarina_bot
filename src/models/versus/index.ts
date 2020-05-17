import { Schema, SchemaTypes, model } from 'mongoose';
import { IVersus, IVersusModel } from './types';

const options = { timestamps: true };

const VersusSchema: Schema = new Schema({
  characters: {
    type: [{
      self: {
        type: SchemaTypes.ObjectId,
        ref: 'character',
        required: true,
      },
      messageId: {
        type: String,
        required: true,
      },
      votes: {
        type: Number,
        default: 0,
      },
    }],
    validate: [(val): boolean => val.length >= 2, 'At least 2 items required'],
    required: true,
  },
  winner: {
    type: SchemaTypes.ObjectId,
    ref: 'character',
  },
  guild: {
    type: SchemaTypes.ObjectId,
    ref: 'guild',
    required: true,
  },
  createdBy: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
    required: true,
  },
}, options);

VersusSchema.index({ 'characters.messageId': 1 });

export default model<IVersus, IVersusModel>('versus', VersusSchema);
