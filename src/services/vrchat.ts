import {
  AuthenticationApi,
  Configuration,
  UsersApi,
  WorldsApi,
} from 'vrchat';

import { createAsyncQueue } from '../utils/limit';

type SearchWorldsParameters = Parameters<WorldsApi['searchWorlds']>;

const { VRC_USERNAME, VRC_PASSWORD } = process.env as Record<string, string>;

// 1req/2s
const enqueue = createAsyncQueue(1, 2 * 1000);

export class VRChat {
  static baseUrl = 'https://vrchat.com';
  static homeUrl = `${VRChat.baseUrl}/home`;
  static baseApiUrl = 'https://api.vrchat.cloud/api/1';

  public worldsApi: WorldsApi;
  public usersApi: UsersApi;
  public authenticationApi: AuthenticationApi;
  private isAuthenticated = false;

  constructor() {
    const configuration = new Configuration({
      username: VRC_USERNAME,
      password: VRC_PASSWORD,
    });

    this.authenticationApi = new AuthenticationApi(configuration);
    this.worldsApi = new WorldsApi();
    this.usersApi = new UsersApi();
  }

  static getWorldPublicUrl(worldId: string) {
    return `${VRChat.homeUrl}/launch?worldId=${worldId}`;
  }

  private async authenticate() {
    if (!this.isAuthenticated) {
      try {
        await this.authenticationApi.getCurrentUser();
      } catch (err) {
        console.error('Failed to authenticate VRChat API', err.response?.data || err);

        throw err;
      }

      this.isAuthenticated = true;
    }
  }

  async getUserByName(username: string) {
    return this.enqueue(() => this.usersApi.getUserByName(username));
  }

  async searchWorlds({
    featured,
    sortBy,
    self,
    userId,
    limit,
    sortOrder,
    offset,
    search,
    tag,
    notag,
    releaseStatus,
    maxUnityVersion,
    minUnityVersion,
    platform,
  }: {
    featured?: SearchWorldsParameters[0];
    sortBy?: SearchWorldsParameters[1];
    self?: SearchWorldsParameters[2];
    userId?: SearchWorldsParameters[3];
    limit?: SearchWorldsParameters[4];
    sortOrder?: SearchWorldsParameters[5];
    offset?: SearchWorldsParameters[6];
    search?: SearchWorldsParameters[7];
    tag?: SearchWorldsParameters[8];
    notag?: SearchWorldsParameters[9];
    releaseStatus?: SearchWorldsParameters[10];
    maxUnityVersion?: SearchWorldsParameters[11];
    minUnityVersion?: SearchWorldsParameters[12];
    platform?: SearchWorldsParameters[13];
  }) {
    return this.enqueue(() => this.worldsApi.searchWorlds(
      featured,
      sortBy,
      self,
      userId,
      limit,
      sortOrder,
      offset,
      search,
      tag,
      notag,
      releaseStatus,
      maxUnityVersion,
      minUnityVersion,
      platform,
    ));
  }

  // eslint-disable-next-line space-before-function-paren
  private async enqueue<T extends (...args: unknown[]) => unknown>(cb: T, tries = 0): Promise<ReturnType<T>> {
    await this.authenticate();

    try {
      return await enqueue(cb) as any;
    } catch (err) {
      if (err.response?.status === 401) {
        if (tries > 0) {
          console.error(err.response.data);

          throw err;
        }

        this.isAuthenticated = false;

        return this.enqueue(cb, tries + 1);
      }

      console.error(err?.response?.data || err);

      throw err;
    }
  }
}
