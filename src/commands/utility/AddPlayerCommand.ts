import { User as DiscordUser } from 'discord.js';
import { Command, expectGuild, expectPermissions } from 'diskat';
import { Guild, User } from '../../models';
import { ScoresaberAPI } from '../../services/scoresaber';

import { Context, GuildDocument, UserDocument } from '../../types';
import { ParameterType, Trigger, CommandGroupName } from '../../utils/constants';
import { injectGuild, injectUser } from '../middleware';
import { ErrorResponse, SuccessResponse } from '../responses';

interface AddPlayerCommandContext extends Context {
  args: {
    url: URL;
    user: DiscordUser;
  };
  user: UserDocument;
  guild: GuildDocument;
}

const AddPlayerCommand: Command<AddPlayerCommandContext> = async (context): Promise<any> => {
  const { args: { url }, user, guild } = context;
  const scoresaber = new ScoresaberAPI();
  let playerId = url.pathname.match(/\d{10,}/)?.[0];

  try {
    ({ playerInfo: { playerId } } = await scoresaber.fetchPlayerBasic(playerId));
  } catch (err) {
    return new ErrorResponse(context, 'Player not found');
  }

  await Promise.all([
    Guild.findByIdAndUpdate(guild._id, {
      $addToSet: {
        'services.scoresaber.playerIds': playerId,
      },
    }),
    User.findByIdAndUpdate(user._id, {
      $set: {
        'services.scoresaber.playerId': playerId,
      },
    }),
  ]);

  return new SuccessResponse({
    title: 'Successfully linked player',
  }, context);
};

AddPlayerCommand.config = {
  triggers: Trigger.ADD_PLAYER,
  description: 'Binds ScoreSaber profile to user',
  group: CommandGroupName.UTILITY,
  middleware: [
    expectGuild(),
    expectPermissions(['ADMINISTRATOR']),
    injectGuild(),
    injectUser(async ({ args }: AddPlayerCommandContext) => ({
      user: args.user,
    })),
  ],
  parameters: [
    {
      name: 'url',
      description: 'player profile url',
      type: ParameterType.URL,
    },
    {
      name: 'user',
      description: 'discord user',
      type: ParameterType.USER,
    },
  ],
};

export default AddPlayerCommand;
