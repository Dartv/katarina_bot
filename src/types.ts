import { Context as DiskatContext } from 'diskat';

import type { Client } from './services/client';

export type Plugin = (client: Client) => void;

export interface Context extends DiskatContext {
  client: Client
}
