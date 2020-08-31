import { TypeResolverFunction, TypeResolver, ParameterType } from 'diskat';
import { User as DiscordUser, GuildMember } from 'discord.js';

import { LocalParameterType } from '../utils/constants';
import { User } from '../models';

export const Parameters: Record<LocalParameterType, TypeResolverFunction> = {
  [LocalParameterType.DB_USER]: TypeResolver.compose(
    ParameterType.USER,
    (user: DiscordUser) => User.findOne({ discordId: user.id }),
  ),
  [LocalParameterType.DB_MEMBER]: TypeResolver.compose(
    ParameterType.MEMBER,
    (user: GuildMember) => User.findOne({ discordId: user.id }),
  ),
};
