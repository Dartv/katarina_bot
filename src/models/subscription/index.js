import mongoose from 'mongoose';
import 'mongoose-type-url';

import { Topics } from '../../util/constants';

const { Schema, SchemaTypes } = mongoose;

const options = { timestamps: true };

const SubscriptionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  topic: {
    type: Number,
    required: true,
    validate: [
      val => Object.values(Topics).includes(val),
      '{PATH} is not an available type',
    ],
  },
  value: { type: SchemaTypes.Mixed, required: true },
}, options);

Object.assign(SubscriptionSchema);

export default mongoose.model('subscription', SubscriptionSchema);
