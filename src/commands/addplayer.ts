import { ICommand, ICommandHandler, ICommandContext } from 'ghastly';
import { Message } from 'discord.js';
import { expectUser } from 'ghastly/lib/middleware';

import { COMMAND_TRIGGERS } from '../util';
import { injectGuild } from './middleware';
import { User, Guild } from '../models';
import { SuccessResponse } from './responses';
import { ScoresaberAPI } from '../services/scoresaber';

const middleware = [
  expectUser(process.env.SUPER_ADMIN_ID),
  injectGuild(),
];

const handler: ICommandHandler = async (context: ICommandContext): Promise<any> => {
  const {
    args: { url },
    guild,
    message,
  } = context;
  const scoresaber = new ScoresaberAPI();
  const playerId = (url as string).match(/\d{10,}/)?.[0];
  const { playerInfo: { playerid } } = await scoresaber.fetchPlayerBasic(playerId);
  const mention = (message as Message).mentions.members.first();

  await Promise.all([
    Guild.findByIdAndUpdate(guild._id, {
      $addToSet: {
        'services.scoresaber.playerids': playerid,
      },
    }),
    mention && User.findOneAndUpdate(
      { discordId: mention.id },
      {
        $setOnInsert: {
          discordId: mention.id,
        },
        $set: {
          'services.scoresaber.playerid': playerid,
        },
      },
      { upsert: true },
    ),
  ]);

  return SuccessResponse('Success', 'Successfully linked player', context);
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.ADD_PLAYER,
  description: '',
  parameters: [
    {
      name: 'url',
      description: 'player profile url',
    },
    {
      name: 'mention',
      description: 'user mention',
      optional: true,
    },
  ],
});
