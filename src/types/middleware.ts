import { User } from 'discord.js';
import { Middleware } from 'diskat';
import { WithCooldownContext } from 'diskat/dist/middleware/withCooldown';

import { Context } from './common';
import { UserDocument, UserCharacterPopulated, GuildDocument } from './model';

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

export interface InjectGuildMiddlewareContext extends Context {
  guild: GuildDocument;
}
export type injectGuildMiddleware = <T extends Context>() => Middleware<T, T & InjectGuildMiddlewareContext>;

export type WithInMemoryCooldownContext = Context & WithCooldownContext;

export type WithPriceMiddleware = <T extends Context & { user: UserDocument }>(price: number) => Middleware<T, T>;
