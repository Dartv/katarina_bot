import mongoose from 'mongoose';
import { isNumber } from 'util';

import { CharacterStar } from '../../util';

const { Schema } = mongoose;

const options = { timestamps: true };

const stars = Object.values(CharacterStar).filter(isNumber);

const CharacterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    min: Math.min(...stars),
    max: Math.max(...stars),
    required: true,
    index: true,
  },
  popularity: {
    type: Number,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  series: [{
    title: String,
    slug: String,
  }],
}, options);

Object.assign(CharacterSchema);

CharacterSchema.index({ name: 'text' });

export default mongoose.model('character', CharacterSchema);
