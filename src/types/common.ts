import { Context as DiskatContext } from 'diskat';
import { User } from 'discord.js';
import Agenda from 'agenda';

import type { Client } from '../services/client';
import type {
  SeriesBase,
  UserDocument,
  UserCharacterDocument,
} from './model';
import type { CharacterStar, MissionCode } from '../utils/constants';

export type Plugin = (client: Client) => void;

export type Job = (agenda: Agenda, client: Client) => void;

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
  additionalStars?: number;
}

export interface Participant {
  user: UserDocument;
  author: User;
  userCharacter: UserCharacterDocument;
}

export interface Events {
  mission: (code: MissionCode, value: unknown, context: Context) => void;
}

export interface MissionDescriptor {
  description: string;
  reward: number;
  silent: boolean;
}
