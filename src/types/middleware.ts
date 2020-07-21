import { User } from 'discord.js';
import { Middleware } from 'diskat';

import { Context } from './common';
import { UserDocument, UserCharacterPopulated } from './model';

export type InjectUserMiddlewareConfig = (context: Context) => Promise<{
  user: User;
}>;
export interface InjectUserMiddlewareContext extends Context {
  user: UserDocument;
}
export type InjectUserMiddleware = (
  config?: InjectUserMiddlewareConfig,
) => Middleware<Context, InjectUserMiddlewareContext>;

export type WithUserCharacterMiddlewareConfig<T extends Context> = (context: T) => Promise<{
  user?: UserDocument;
  slug: string;
}>;
export interface WithUserCharacterMiddlewareContext extends Context {
  userCharacter: UserCharacterPopulated;
}
export type WithUserCharacterMiddleware = <T extends Context>(
  config: WithUserCharacterMiddlewareConfig<T>,
) => Middleware<T, T & WithUserCharacterMiddlewareContext>;
