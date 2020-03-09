import request, { OptionsWithUrl } from 'request-promise-native';
import merge from 'deepmerge';

import { HTTPMethod } from '../util';
import { limitScoresaberApiCalls } from '../util/limit';

export class ScoresaberAPI {
  static OLD_BASE_URL = 'https://scoresaber.com';

  static BASE_URL = 'https://new.scoresaber.com';

  static API_BASE = `${ScoresaberAPI.BASE_URL}/api/`;

  static getBeatmapImage(beatmapId: string) {
    return `${ScoresaberAPI.BASE_URL}/api/static/covers/${beatmapId}.png`;
  }

  static getPlayerAvatar(avatarUrl: string) {
    return `${ScoresaberAPI.BASE_URL}${avatarUrl}`;
  }

  static getLeaderboardUrl(leaderboardId: string, rank = 1) {
    return `${ScoresaberAPI.OLD_BASE_URL}/leaderboard/${leaderboardId}?page=${Math.ceil(rank / 12)}`;
  }

  static getMapperUrl(mapperName: string) {
    return `${ScoresaberAPI.OLD_BASE_URL}?search=${mapperName}`;
  }

  fetchPlayerBasic(playerId: string): Promise<any> {
    return this.callApi(`player/${playerId}/basic`);
  }

  fetchPlayerFull(playerId: string): Promise<any> {
    return this.callApi(`player/${playerId}/full`);
  }

  fetchPlayerRecentScores(playerId: string): Promise<any> {
    return this.callApi(`player/${playerId}/scores/recent`);
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

    return limitScoresaberApiCalls(() => {
      console.log(
        `making api call to ${opts.method} ${opts.url}${opts.body ? ` with body ${JSON.stringify(opts.body)}` : ''}`,
      );

      return request(opts).catch((err) => {
        console.error(`Api call to Hive failed for ${opts.url}. Error: ${err.toString()}`);
        throw err;
      });
    });
  }
}
