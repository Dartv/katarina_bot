import request, { OptionsWithUrl } from 'request-promise-native';
import merge from 'deepmerge';

import { HTTPMethod } from '../utils/constants';
import { limitScoresaberApiCalls } from '../utils/limit';

export interface PlayerBadge {
  image: string;
  description: string;
}

export interface PlayerInfo {
  playerId: string;
  playerName: string;
  avatar: string;
  rank: number;
  countryRank: number;
  pp: number;
  country: number;
  role: string;
  badges: PlayerBadge[];
  history: string;
  permissions: number;
  inactive: number;
  banned: number;
}

export interface PlayerScoreStats {
  totalScore: number;
  totalRankedScore: number;
  averageRankedAccuracy: number;
  totalPlayCount: number;
  rankedPlayCount: number;
}

export interface PlayerRecentScore {
  rank: number;
  scoreId: number;
  score: number;
  unmodififiedScore: number;
  mods: string;
  pp: number;
  weight: number;
  timeSet: string;
  leaderboardId: number;
  songHash: string;
  songName: string;
  songSubName: string;
  songAuthorName: string;
  levelAuthorName: string;
  difficulty: number;
  difficultyRaw: string;
  maxScore: number;
}

export interface PlayerBasic {
  playerInfo: PlayerInfo;
}

export interface PlayerFull {
  playerInfo: PlayerInfo;
  scoreStats: PlayerScoreStats;
}

export interface PlayerRecentScores {
  scores: PlayerRecentScore[];
}

export class ScoresaberAPI {
  static OLD_BASE_URL = 'https://scoresaber.com';

  static BASE_URL = 'https://new.scoresaber.com';

  static API_BASE = `${ScoresaberAPI.BASE_URL}/api/`;

  static getBeatmapImage(songHash: string): string {
    return `${ScoresaberAPI.OLD_BASE_URL}/imports/images/songs/${songHash}.png`;
  }

  static getPlayerAvatar(avatarUrl: string): string {
    return `${ScoresaberAPI.BASE_URL}${avatarUrl}`;
  }

  static getLeaderboardUrl(leaderboardId: number, rank = 1): string {
    return `${ScoresaberAPI.OLD_BASE_URL}/leaderboard/${leaderboardId}?page=${Math.ceil(rank / 12)}`;
  }

  static getMapperUrl(mapperName: string): string {
    return `${ScoresaberAPI.OLD_BASE_URL}?search=${mapperName}`;
  }

  fetchPlayerBasic(playerId: string): Promise<PlayerBasic> {
    return this.callApi(`player/${playerId}/basic`);
  }

  fetchPlayerFull(playerId: string): Promise<PlayerFull> {
    return this.callApi(`player/${playerId}/full`);
  }

  fetchPlayerRecentScores(playerId: string): Promise<PlayerRecentScores> {
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

    return limitScoresaberApiCalls(async () => {
      console.log(
        `making api call to ${opts.method} ${opts.url}${opts.body ? ` with body ${JSON.stringify(opts.body)}` : ''}`,
      );

      return request(opts).catch((err) => {
        console.error(`Api call to ScoreSaber failed for ${opts.url}`);
        console.error(err);
        throw err;
      });
    });
  }
}
