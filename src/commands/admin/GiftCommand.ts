import { Command, TypeResolver } from 'diskat';
import { GuildMember } from 'discord.js';

import { Context, UserDocument, InjectUserMiddlewareContext } from '../../types';
import {
  Trigger,
  CommandGroupName,
  CharacterStar,
  ParameterType,
} from '../../utils/constants';
import { expectOwner } from '../middleware/expectOwner';
import { Character } from '../../models';
import { getPopularityRangeByStarRating } from '../../utils/character';
import { injectUser } from '../middleware';

interface GiftCommandContext extends Context {
  args: {
    stars: CharacterStar;
    member: GuildMember;
    user: UserDocument;
  };
}

const GiftCommand: Command<GiftCommandContext> = async (context) => {
  const { args: { stars, user, member }, message } = context;
  const [$gte, $lte] = getPopularityRangeByStarRating(stars);
  const [character] = await Character.random(1, [
    {
      $match: {
        popularity: {
          $lte,
          $gte,
        },
      },
    },
  ]);
  const userCharacter = await user.characters.add(character);
  await user.save();
  return message.channel.send(`${member}, you were gifted "${character.name}"`, {
    embed: userCharacter.createEmbed(),
  });
};

GiftCommand.config = {
  triggers: Trigger.GIFT,
  description: 'Gift a character to someone',
  group: CommandGroupName.ADMIN,
  parameters: [
    {
      name: 'member',
      description: 'member',
      type: ParameterType.MEMBER,
    },
    {
      name: 'stars',
      description: 'stars',
      optional: true,
      defaultValue: CharacterStar.FIVE_STAR,
      type: TypeResolver.oneOf(
        ParameterType.NUMBER,
        Object.values(CharacterStar),
      ),
    },
  ],
  middleware: [
    expectOwner(),
    injectUser(async ({ args: { member } }: GiftCommandContext) => ({
      user: member.user,
    })),
    async (next, context: InjectUserMiddlewareContext) => next({
      ...context,
      args: { ...context.args, user: context.user },
    }),
  ],
};

export default GiftCommand;
