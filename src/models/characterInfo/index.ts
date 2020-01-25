import {
  Schema,
  model,
  SchemaTypes,
  SchemaOptions,
} from 'mongoose';

import { ICharacterInfo, ICharacterInfoModel } from './types';
import User from '../user';
import { EXPToLVLUp } from '../../util';
import { createCharacterEmbed } from '../character/util';
import Character from '../character';

const options: SchemaOptions = { timestamps: true, collection: 'characterInfo' };

const CharacterInfoSchema = new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: User.modelName,
  },
  character: {
    type: SchemaTypes.ObjectId,
    required: true,
    ref: User.modelName,
  },
  level: {
    type: Number,
    default: 1,
  },
  exp: {
    type: Number,
    default: 0,
  },
}, options);

CharacterInfoSchema.index({ user: 1, character: 1 }, { unique: true });

CharacterInfoSchema.pre<ICharacterInfo>('save', async function () {
  if (this.exp >= EXPToLVLUp[this.level + 1]) {
    this.level += 1;
    const character = await Character.findOne({ _id: this.character }).populate('series');
    if (character) {
      const embed = createCharacterEmbed({
        ...character,
        level: this.level,
        exp: this.exp,
      });
      this.$locals.context.message.reply(`${character.name} leveled up`, { embed });
    }
  }
});

export default model<ICharacterInfo, ICharacterInfoModel>('characterInfo', CharacterInfoSchema);
