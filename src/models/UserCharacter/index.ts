import {
  SchemaOptions,
  Schema,
  SchemaTypes,
  model,
} from 'mongoose';

import type { UserCharacterDocument, UserCharacterModel } from '../../types';
import { ModelName } from '../../utils/constants';

const options: SchemaOptions = { timestamps: true };

const UserCharacterSchema = new Schema({
  character: {
    type: SchemaTypes.ObjectId,
    ref: ModelName.CHARACTER,
  },
}, options);

export const UserCharacter = model<UserCharacterDocument, UserCharacterModel>(
  ModelName.USER_CHARACTER,
  UserCharacterSchema,
);
