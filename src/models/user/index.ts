import mongoose from 'mongoose';
import 'mongoose-type-url';
import * as statics from './statics';
import * as methods from './methods';

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
        type: SchemaTypes.Url,
        maxlength: 2000,
      },
    }],
    max: 50,
    default: [],
  },
  characters: [SchemaTypes.ObjectId],
  favorites: [SchemaTypes.ObjectId],
  lastRolledAt: Date,
}, options);

Object.assign(UserSchema, { statics, methods });

export default mongoose.model('user', UserSchema);
