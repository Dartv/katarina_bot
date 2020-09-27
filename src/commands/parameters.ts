import {
  TypeResolverFunction,
  TypeResolver,
  ParameterType,
  TypeResolverContext,
} from 'diskat';
import { User as DiscordUser, GuildMember } from 'discord.js';

import { LocalParameterType } from '../utils/constants';
import { User } from '../models';
import { UserDocument } from '../types';

export const Parameters: Record<LocalParameterType, TypeResolverFunction> = {
  [LocalParameterType.DB_USER]: TypeResolver.compose<TypeResolverContext<DiscordUser>, UserDocument>(
    ParameterType.USER,
    async ({ value: user }) => User.findOne({ discordId: user.id }),
  ),
  [LocalParameterType.DB_MEMBER]: TypeResolver.compose<TypeResolverContext<GuildMember>, UserDocument>(
    ParameterType.MEMBER,
    async ({ value: user }) => User.findOne({ discordId: user.id }),
  ),
};
