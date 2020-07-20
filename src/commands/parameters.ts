import { TypeResolverFunction, TypeResolver, ParameterType } from 'diskat';
import { User as DiscordUser } from 'discord.js';

import { LocalParameterType } from '../utils/constants';
import { User } from '../models';

export const Parameters: Record<LocalParameterType, TypeResolverFunction> = {
  [LocalParameterType.DB_USER]: TypeResolver.compose(
    ParameterType.USER,
    (user: DiscordUser) => User.findOne({ discordId: user.id }),
  ),
};
