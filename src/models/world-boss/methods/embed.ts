import { RichEmbed } from 'discord.js';

import { IWorldBoss } from '../types';
import { createCharacterEmbed } from '../../character/util';
import { ICharacter } from '../../character/types';
import { Color } from '../../../util';

export default async function worldBossEmbed(this: IWorldBoss): Promise<RichEmbed> {
  await this.populate('character').execPopulate();
  const character = this.character as ICharacter;
  const embed = createCharacterEmbed({
    ...character.toObject(),
    stars: 10,
    series: [],
  });

  embed
    .setColor(Color.DARK_RED)
    .addField('HP ❤️', `${this.hp || '?'}/${this.maxHp || '?'}`);

  return embed;
}
