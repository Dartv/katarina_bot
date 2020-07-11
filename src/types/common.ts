import { Context as DiskatContext } from 'diskat';

import type { Client } from '../services/client';
import type { SeriesBase } from './model';
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
