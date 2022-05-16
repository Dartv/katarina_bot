import request, { OptionsWithUrl } from 'request-promise-native';
import merge from 'deepmerge';

import { HTTPMethod } from '../utils/constants';

export interface BeatSaviorInfo {
  songID: string;
  songDifficultyRank: number;
  trackers: Trackers
}

export interface Trackers {
  hitTracker: HitTracker;
  winTracker: WinTracker;
  scoreTracker: ScoreTracker;
}

export interface HitTracker {
  bombHit: number;
  maxCombo: number;
  nbOfWallHit: number;
  missedNotes: number;
  badCuts: number;
}

export interface WinTracker {
  won: true
}

export interface ScoreTracker {
  personalBestRawRatio: number;
  rawRatio: number;
}

export class BeatsaviorAPI {
  static BASE_URL = 'https://beat-savior.herokuapp.com';
  static API_BASE = `${BeatsaviorAPI.BASE_URL}/api`;

  fetchUserLastPlayedInfo(playerId: string): Promise<BeatSaviorInfo[]> {
    return this.callApi(`livescores/player/${playerId}`);
  }

  async callApi(path: string, options: Partial<OptionsWithUrl> = {}): Promise<any> {
    const url = `${BeatsaviorAPI.API_BASE}/${path}`;
    const defaults: OptionsWithUrl = {
      url,
      method: HTTPMethod.GET,
      headers: {
        Accept: 'application/json',
      },
      json: true,
    };
    const opts = merge(defaults, options);

    return request(opts).catch((err) => {
      console.error(`Api call to BeatSavior failed for ${opts.url}`);
      console.error(err);
      throw err;
    });
  }
}
