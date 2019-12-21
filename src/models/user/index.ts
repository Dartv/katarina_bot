import mongoose from 'mongoose';
import * as statics from './statics';
import * as methods from './methods';
import Character from '../character';
import { DeckLimit } from '../../util';

const { Schema, SchemaTypes } = mongoose;

const options = { timestamps: true };

const UserSchema = new Schema({
  discordId: { type: String, required: true, index: true },
  images: {
    type: [{
      ref: {
        type: String,
        maxlength: 40,
      },
      url: {
        type: String,
        maxlength: 2000,
      },
    }],
    max: 50,
    default: [],
  },
  characters: {
    type: [SchemaTypes.ObjectId],
    default: [],
  },
  favorites: {
    type: [SchemaTypes.ObjectId],
    default: [],
    max: 20,
  },
  lastRolledAt: Date,
  waifu: {
    type: SchemaTypes.ObjectId,
    ref: Character.modelName,
  },
  quote: String,
  deck: {
    type: [SchemaTypes.ObjectId],
    default: [],
    min: DeckLimit.MIN,
    max: DeckLimit.MAX,
  },
}, options);

Object.assign(UserSchema, { statics, methods });

export default mongoose.model('user', UserSchema);
