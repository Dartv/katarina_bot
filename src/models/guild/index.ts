import mongoose from 'mongoose';
import 'mongoose-type-url';

import * as statics from './statics';
import * as methods from './methods';

const { Schema, SchemaTypes } = mongoose;

const options = { timestamps: true };

const GuildSchema = new Schema({
  discordId: { type: String, required: true, index: true },
  prefix: { type: String, index: true },
  images: {
    type: [{
      ref: {
        type: String,
        maxlength: 40,
        required: true,
      },
      url: {
        type: SchemaTypes.Url,
        maxlength: 2000,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    }],
    max: 200,
    default: [],
  },
}, options);

Object.assign(GuildSchema, { statics, methods });

export default mongoose.model('guild', GuildSchema);
