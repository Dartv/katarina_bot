import { Client as DiskatClient, ClientOptions, Command } from 'diskat';
import { Signale } from 'signale';
import { Collection } from 'discord.js';

import type { Plugin } from '../types';
import { logger } from './logger';
import * as Commands from '../commands';

export class Client extends DiskatClient {
  logger: Signale;
  plugins: Collection<string, Plugin> = new Collection();

  constructor(options: ClientOptions) {
    super(options);

    this.logger = logger;

    Object.values(Commands).forEach((command: Command<any, unknown>) => {
      this.commands.add(() => command);
    });

    this.once('ready', () => {
      this.plugins.forEach((plugin) => {
        plugin(this);
      });
    });
  }
}
