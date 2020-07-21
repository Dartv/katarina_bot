import { Context as DiskatContext } from 'diskat';
import { User } from 'discord.js';

import type { Client } from '../services/client';
import type { SeriesBase, UserDocument, UserCharacterDocument } from './model';
import type { CharacterStar } from '../utils/constants';

export type Plugin = (client: Client) => void;

export interface Context extends DiskatContext {
  client: Client
}

export interface CharacterEmbedOptions {
  name: string;
  description?: string;
  imageUrl?: string;
  series?: SeriesBase[];
  color?: number;
  stars?: CharacterStar;
  additionalStars: number;
}

export interface Participant {
  user: UserDocument;
  author: User;
  userCharacter: UserCharacterDocument;
}
