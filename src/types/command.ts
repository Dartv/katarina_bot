import { CommandConfigurator as DiskatCommandConfigurator } from 'diskat';

import { Context } from './common';
import { Client } from '../services/client';

export type CommandConfigurator<T extends Context = Context, R = unknown> = DiskatCommandConfigurator<T, R, Client>;
