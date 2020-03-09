import { ICommand, ICommandHandler, ICommandContext } from 'ghastly';
import request, { OptionsWithUrl } from 'request-promise-native';
import merge from 'deepmerge';
import { Message } from 'discord.js';
import { expectUser } from 'ghastly/lib/middleware';

import { COMMAND_TRIGGERS, HTTPMethod } from '../util';
import { injectGuild } from './middleware';
import { User, Guild } from '../models';
import { SuccessResponse } from './responses';

const middleware = [
  expectUser(process.env.SUPER_ADMIN_ID),
  injectGuild(),
];

class ScoresaberAPI {
  static API_BASE = 'https://new.scoresaber.com/api/';

  fetchPlayer(id: string): Promise<any> {
    return this.callApi(`player/${id}/basic`);
  }

  async callApi(path: string, options: Partial<OptionsWithUrl> = {}): Promise<any> {
    const url = `${ScoresaberAPI.API_BASE}${path}`;
    const defaults: OptionsWithUrl = {
      url,
      method: HTTPMethod.GET,
      headers: {
        Accept: 'application/json',
      },
      json: true,
    };
    const opts = merge(defaults, options);

    console.log(
      `making api call to ${opts.method} ${opts.url}${opts.body ? ` with body ${JSON.stringify(opts.body)}` : ''}`,
    );

    return request(opts).catch((err) => {
      console.error(`Api call to Hive failed for ${opts.url}. Error: ${err.toString()}`);
      throw err;
    });
  }
}

const handler: ICommandHandler = async (context: ICommandContext): Promise<any> => {
  const {
    args: { url },
    guild,
    message,
  } = context;
  const scoresaber = new ScoresaberAPI();
  const playerId = (url as string).match(/\d{10,}$/)?.[0];
  const { playerInfo: { playerid } } = await scoresaber.fetchPlayer(playerId);
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
