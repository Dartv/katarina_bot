import { CommandConfigurator as DiskatCommandConfigurator } from 'diskat';

import type { Client } from '../services/client';
import type { BannerType } from '../utils/constants';
import { UserDocument } from './model';
import { Context } from './common';

export type CommandConfigurator<T extends Context = Context, R = unknown> = DiskatCommandConfigurator<T, R, Client>;

export interface RollCommandContext extends Context {
  user: UserDocument;
  args: {
    banner: BannerType;
  };
}
