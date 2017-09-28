const mongoose = require('mongoose');
require('mongoose-type-url');

const statics = require('./statics');
const methods = require('./methods');

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
    max: 20,
  },
}, options);

Object.assign(UserSchema, { statics, methods });

module.exports = mongoose.model('user', UserSchema);
