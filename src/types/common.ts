import { Context as DiskatContext, CommandConfigurator as DiskatCommandConfigurator } from 'diskat';
import { User } from 'discord.js';
import { Agenda } from '@hokify/agenda';

import type { Client } from '../services/client';
import type {
  SeriesBase,
  UserDocument,
  UserCharacterDocument,
} from './model';
import type {
  CharacterStar,
  MissionCode,
  AchievementCode,
  MissionFrequency,
} from '../utils/constants';

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

export interface MissionEventContext extends Context {
  user?: UserDocument;
  silent?: boolean;
}

export interface AchievementEventContext extends Context {
  user?: UserDocument;
}

export interface Events {
  mission: (code: MissionCode, value: unknown, context: MissionEventContext) => void;
  achievement: (code: AchievementCode, value: unknown, context: AchievementEventContext) => void;
}

export interface MissionDescriptor {
  description: string;
  reward: number;
  frequency: MissionFrequency;
}

export type CommandConfigurator<T extends Context = Context, R = unknown> = DiskatCommandConfigurator<T, R, Client>;
