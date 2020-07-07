import { User } from 'discord.js';
import { Middleware } from 'diskat';

import { Context } from './common';
import { UserDocument } from './model';

export type InjectUserMiddlewareConfig = (context: Context) => Promise<{ user: User }>;
export interface InjectUserMiddlewareContext extends Context {
  user: UserDocument;
}
export type InjectUserMiddleware = (
  config?: InjectUserMiddlewareConfig,
) => Middleware<Context, InjectUserMiddlewareContext>;
