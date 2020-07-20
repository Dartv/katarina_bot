import {
  Client as DiskatClient,
  ClientOptions,
  Command,
  expectGuild,
} from 'diskat';
import { Signale } from 'signale';
import { Collection } from 'discord.js';

import type { Plugin } from '../types';
import { logger } from './logger';
import * as Commands from '../commands';
import { CommandGroupName } from '../utils/constants';
import { Parameters } from '../commands/parameters';

export class Client extends DiskatClient {
  logger: Signale;
  plugins: Collection<string, Plugin> = new Collection();

  constructor(options: ClientOptions) {
    super(options);

    this.logger = logger;

    Object.entries(Parameters).forEach(([key, resolver]) => {
      this.types.set(key, resolver.bind(this.types));
    });

    Object.values(Commands).forEach((command: Command<any, unknown>) => {
      this.commands.add(() => command);
    });

    this.commands.applyGroupMiddleware(CommandGroupName.GACHA, [
      expectGuild(),
    ]);

    this.once('ready', () => {
      this.plugins.forEach((plugin) => {
        plugin(this);
      });
    });
  }
}
