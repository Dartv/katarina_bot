import { Command, expectGuild, expectUser } from 'diskat';
import { User as VRChatUser } from 'vrchat';
import { Guild } from '../../models';
import { VRChat } from '../../services/vrchat';

import { Context, GuildDocument, UserDocument } from '../../types';
import { ParameterType, Trigger, CommandGroupName } from '../../utils/constants';
import { injectGuild } from '../middleware';
import { ErrorResponse, SuccessResponse } from '../responses';

interface TrackVRCHATCreatorCommandContext extends Context {
  args: {
    username: string;
  };
  user: UserDocument;
  guild: GuildDocument;
}

const ALLOWED_USERS = ['277826407386710016', '208664325852889089', '303159801859538955'];

const TrackVRCHATCreatorCommand: Command<TrackVRCHATCreatorCommandContext> = async (context): Promise<any> => {
  const { args: { username }, guild } = context;
  const vrchat = new VRChat();
  let user: VRChatUser;

  try {
    ({ data: user } = await vrchat.getUserByName(username));
  } catch (err) {
    return new ErrorResponse(context, `VRChat user ${username} not found`);
  }

  await Guild.findByIdAndUpdate(guild._id, {
    $addToSet: {
      'services.vrchat.trackedCreatorIds': user.id,
    },
  });

  return new SuccessResponse({
    description: `You will now receive a notification when user "${username}" publishes a new world`,
  }, context);
};

TrackVRCHATCreatorCommand.config = {
  triggers: Trigger.TRACK_VRCHAT_CREATOR,
  description: 'Tracks VRChat world creators',
  group: CommandGroupName.VRCHAT,
  middleware: [
    expectGuild(),
    expectUser(ALLOWED_USERS),
    injectGuild(),
  ],
  parameters: [
    {
      name: 'username',
      description: 'username',
      type: ParameterType.STRING,
    },
  ],
};

export default TrackVRCHATCreatorCommand;
