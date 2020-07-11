import { DiscordLimit } from './constants';

export const resolveEmbedDescription = (
  description: string,
): string => description.slice(0, DiscordLimit.EMBED_DESCRIPTION - 3).concat('...');
