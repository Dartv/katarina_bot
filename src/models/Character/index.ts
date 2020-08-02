import {
  Schema,
  SchemaTypes,
  model,
  SchemaOptions,
} from 'mongoose';

import { ModelName } from '../../utils/constants';
import type { CharacterDocument, CharacterModel } from '../../types';
import * as statics from './statics';

const options: SchemaOptions = { timestamps: true };

const CharacterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  popularity: {
    type: Number,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  series: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: ModelName.SERIES,
    }],
    default: [],
  },
}, options);

CharacterSchema.index({ name: 'text' });
CharacterSchema.index({ series: 1 });
CharacterSchema.index({ popularity: 1 });
CharacterSchema.index({ slug: 1 }, { unique: true });

Object.assign(CharacterSchema, { statics });

export const Character = model<CharacterDocument, CharacterModel>(ModelName.CHARACTER, CharacterSchema);
