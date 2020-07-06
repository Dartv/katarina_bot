import {
  Context as DiskatContext,
  CommandConfigurator as DiskatCommandConfigurator,
} from 'diskat';

import type { Client } from './services/client';

export type Plugin = (client: Client) => void;

export interface Context extends DiskatContext {
  client: Client
}

export type CommandConfigurator<T extends Context = Context, R = unknown> = DiskatCommandConfigurator<T, R, Client>;
